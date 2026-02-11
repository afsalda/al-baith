import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@insforge/sdk';
import { Resend } from 'resend';

// Hardcoded credentials for debugging - will remove after fix confirmed
const INSFORGE_URL = 'https://i8m3i9mq.us-west.insforge.app';
const INSFORGE_KEY = 'ik_193e152f1386d1beed3ac3af245345b01773d53da044715f726c94493c64ada3';

const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_KEY,
});

// Resend API Key
const RESEND_KEY = process.env.RESEND_API_KEY || 're_GAj1ujqY_6YKnke9bZ72wmyLEi7ZpWcqF';
const resend = new Resend(RESEND_KEY);

console.log('[API] Initializing Resend with key:', RESEND_KEY ? `${RESEND_KEY.substring(0, 5)}...` : 'undefined');

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, phone, email, room_type, check_in, check_out, guests = '1 adult' } = req.body;

    if (!name || !phone || !email || !room_type || !check_in || !check_out) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        console.log('[API] New booking request for:', email, room_type);

        const db = insforge.database;

        // 1. Check if user exists
        let userId;
        console.log('[API] Checking user...');
        const { data: users, error: userError } = await db
            .from('users')
            .select('id')
            .eq('email', email);

        if (userError) {
            console.error('[API] User check error:', userError);
            throw userError;
        }

        if (users && users.length > 0) {
            userId = users[0].id;
            console.log('[API] Existing user found:', userId);
        } else {
            console.log('[API] Creating new user...');
            const { data: newUser, error: createError } = await db
                .from('users')
                .insert([
                    {
                        name,
                        email,
                        phone,
                        password: 'guest-pass',
                        role: 'CUSTOMER',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ])
                .select('id')
                .single();

            if (createError) {
                console.error('[API] User creation error:', createError);
                throw createError;
            }
            userId = newUser.id;
            console.log('[API] New user created:', userId);
        }

        // 2. Find the room
        console.log('[API] Finding room type:', room_type);
        const { data: rooms, error: roomError } = await db
            .from('rooms')
            .select('id, price')
            .eq('roomType', room_type)
            .limit(1);

        if (roomError) {
            console.error('[API] Room search error:', roomError);
            throw roomError;
        }

        if (!rooms || rooms.length === 0) {
            console.warn('[API] Room not found:', room_type);
            return res.status(404).json({ error: `Room type '${room_type}' not found.` });
        }
        const roomId = rooms[0].id;
        const price = rooms[0].price;

        // 3. Create the booking
        console.log('[API] Creating booking for room:', roomId);
        const { data: booking, error: bookingError } = await db
            .from('bookings')
            .insert([
                {
                    userId,
                    roomId,
                    checkIn: new Date(check_in).toISOString(),
                    checkOut: new Date(check_out).toISOString(),
                    totalAmount: price,
                    status: 'CONFIRMED',
                    bookingTime: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ])
            .select('id')
            .single();

        if (bookingError) {
            console.error('[API] Booking insert error:', bookingError);
            throw bookingError;
        }
        const bookingId = booking.id;
        console.log('[API] Booking created:', bookingId);

        // 4. Record availability
        console.log('[API] Recording availability...');
        let curr = new Date(check_in);
        const end = new Date(check_out);
        const availabilityRecords = [];

        while (curr < end) {
            availabilityRecords.push({
                roomId,
                date: new Date(curr).toISOString(),
                isBooked: true,
                bookingId
            });
            curr.setDate(curr.getDate() + 1);
        }

        if (availabilityRecords.length > 0) {
            const { error: avError } = await db
                .from('room_availability')
                .upsert(availabilityRecords, { onConflict: 'roomId,date' });

            if (avError) {
                console.error('[API] Availability upsert error:', avError);
                throw avError;
            }
        }

        // Calculate nights for the email
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
        const totalPrice = price * nights;
        const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Send emails sequentially to debug delivery issues
        const adminEmailRecipient = 'muhammedafsalda@gmail.com'; // Resend free tier verified email
        console.log(`[API] 1. Sending Admin Notification to ${adminEmailRecipient}...`);
        try {
            // Simplified Admin Email to reduce spam filtering
            const bookingTime = new Date().toLocaleTimeString();
            const { data: adminData, error: adminError } = await resend.emails.send({
                from: 'Al-Baith Resort <onboarding@resend.dev>',
                to: adminEmailRecipient,
                subject: `🔔 NEW BOOKING: ${name} [${bookingTime}]`,
                text: `New Booking Request\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nRoom: ${room_type}\nDates: ${check_in} to ${check_out}\nGuests: ${guests}\nPrice: ₹${totalPrice.toLocaleString()}\n\nBooking ID: ${bookingId}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px;">
                        <h2 style="color: #2563eb; margin-top: 0;">New Booking Request</h2>
                        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <p style="margin: 5px 0;"><strong>Customer:</strong> ${name}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
                        </div>
                        <div style="padding: 10px 0;">
                            <p style="margin: 5px 0;"><strong>Room:</strong> ${room_type}</p>
                            <p style="margin: 5px 0;"><strong>Dates:</strong> ${check_in} — ${check_out}</p>
                            <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
                            <p style="margin: 5px 0;"><strong>Total Price:</strong> <span style="font-size: 1.2em; font-weight: bold;">₹${totalPrice.toLocaleString()}</span></p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #6b7280;">Booking ID: ${bookingId} • Time: ${bookingTime}</p>
                    </div>
                `,
            });

            if (adminError) {
                console.error('[API] ❌ Admin email FAILED:', JSON.stringify(adminError));
            } else {
                console.log('[API] ✅ Admin notification sent:', JSON.stringify(adminData));
            }
        } catch (err) {
            console.error('[API] ❌ Admin email CRASHED:', err);
        }

        console.log(`[API] 2. Sending Customer Confirmation to ${email} (with BCC to Admin)...`);
        try {
            // Note: On free tier, 'to' must be 'muhammedafsalda@gmail.com' or verified domain. 
            // If 'email' is 'muhammedafsalda@gmail.com', it works. If not, it fails.
            const { data: customerData, error: customerError } = await resend.emails.send({
                from: 'Al-Baith Resort <onboarding@resend.dev>',
                to: email, // This will fail if not verified, but we catch it.
                bcc: adminEmailRecipient, // ⚠️ BACKUP: Ensure admin gets a copy!
                subject: `✨ Booking Confirmed - Al-Baith Resort | ${room_type} #${bookingId.substring(0, 4)}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #fffdf7; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.08); border: 1px solid #f0e6cc;">

                        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 48px 32px; text-align: center; position: relative;">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #B8860B, #FFD700, #FFF9C4, #FFD700, #B8860B);"></div>
                            <h1 style="color: #FFD700; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 4px; font-family: Georgia, 'Times New Roman', serif;">AL-BAITH</h1>
                            <p style="color: #d4af37; margin: 6px 0 0; font-size: 12px; letter-spacing: 6px; text-transform: uppercase;">Resort & Residences</p>
                            <div style="margin-top: 24px; padding: 12px 28px; display: inline-block; background: linear-gradient(135deg, #B8860B, #FFD700); border-radius: 50px;">
                                <span style="color: #1a1a2e; font-size: 15px; font-weight: 700; letter-spacing: 1px;">✓ BOOKING CONFIRMED</span>
                            </div>
                        </div>

                        <div style="padding: 36px 32px 0;">
                            <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 8px; font-weight: 600;">Dear ${name},</h2>
                            <p style="color: #6b7280; font-size: 15px; margin: 0; line-height: 1.6;">Thank you for choosing Al-Baith Resort. Your reservation has been confirmed. We look forward to welcoming you and providing an exceptional experience.</p>
                        </div>

                        <div style="padding: 28px 32px;">
                            <div style="background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e8dcc8; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
                                <div style="background: linear-gradient(135deg, #f8f0e0, #faf6ed); padding: 16px 20px; border-bottom: 1px solid #e8dcc8;">
                                    <h3 style="color: #92640a; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Reservation Details</h3>
                                </div>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 14px 20px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; width: 140px; border-bottom: 1px solid #f3f0e8;">Booking ID</td>
                                        <td style="padding: 14px 20px; color: #1a1a2e; font-size: 14px; font-weight: 700; font-family: 'Courier New', monospace; border-bottom: 1px solid #f3f0e8;">${bookingId}</td>
                                    </tr>
                                    <tr style="background: #fdfbf5;">
                                        <td style="padding: 14px 20px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f3f0e8;">Room Type</td>
                                        <td style="padding: 14px 20px; color: #1a1a2e; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f3f0e8;">${room_type}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 14px 20px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f3f0e8;">Check-in</td>
                                        <td style="padding: 14px 20px; color: #1a1a2e; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f3f0e8;">📅 ${formatDate(checkInDate)}</td>
                                    </tr>
                                    <tr style="background: #fdfbf5;">
                                        <td style="padding: 14px 20px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f3f0e8;">Check-out</td>
                                        <td style="padding: 14px 20px; color: #1a1a2e; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f3f0e8;">📅 ${formatDate(checkOutDate)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 14px 20px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f3f0e8;">Guests</td>
                                        <td style="padding: 14px 20px; color: #1a1a2e; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f3f0e8;">${guests}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 14px 20px; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f3f0e8;">Rate / Night</td>
                                        <td style="padding: 14px 20px; color: #1a1a2e; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f3f0e8;">₹${price.toLocaleString()}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div style="padding: 0 32px 32px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">Need help? Contact us at</p>
                            <a href="mailto:albaith.booking@gmail.com" style="color: #B8860B; font-size: 14px; font-weight: 600; text-decoration: none;">albaith.booking@gmail.com</a>
                        </div>
                    </div>
                `,
            });

            if (customerError) {
                console.error('[API] ❌ Customer email FAILED:', JSON.stringify(customerError));
            } else {
                console.log('[API] ✅ Customer confirmation sent (BCC included):', JSON.stringify(customerData));
            }
        } catch (err) {
            console.error('[API] ❌ Customer email CRASHED:', err);
        }

        return res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            bookingId
        });

    } catch (error: any) {
        console.error('[API] CRITICAL ERROR:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message || 'An unknown error occurred',
            raw: JSON.stringify(error)
        });
    }
}
