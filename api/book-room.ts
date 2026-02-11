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

// Use environment variable for Resend API key (configured in Vercel), with fallback for local dev
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

        // Send email (non-blocking — booking is already saved)
        try {
            console.log('[API] Sending admin notification email...');

            // Send single admin notification email with all details
            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'Al-Baith Resort <onboarding@resend.dev>',
                to: 'albaith.booking@gmail.com',
                subject: `🏨 Booking Request - ${name} | ${room_type}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Booking Request</h1>
                            <p style="color: #93c5fd; margin: 8px 0 0; font-size: 14px;">Customer Details Enclosed</p>
                        </div>
                        <div style="padding: 32px 24px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 140px;">Guest Name</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${name}</td></tr>
                                <tr style="background: #f9fafb;"><td style="padding: 10px 8px; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 10px 8px; color: #111827; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td></tr>
                                <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Phone</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${phone}</td></tr>
                                <tr style="background: #f9fafb;"><td style="padding: 10px 8px; color: #6b7280; font-size: 14px;">Room Type</td><td style="padding: 10px 8px; color: #111827; font-size: 14px; font-weight: 600;">${room_type}</td></tr>
                                <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Check-in</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">📅 ${check_in}</td></tr>
                                <tr style="background: #f9fafb;"><td style="padding: 10px 8px; color: #6b7280; font-size: 14px;">Check-out</td><td style="padding: 10px 8px; color: #111827; font-size: 14px; font-weight: 600;">📅 ${check_out}</td></tr>
                                <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Guests</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${guests}</td></tr>
                                <tr style="background: #f9fafb;"><td style="padding: 10px 8px; color: #6b7280; font-size: 14px;">Nights</td><td style="padding: 10px 8px; color: #111827; font-size: 14px; font-weight: 600;">${nights}</td></tr>
                                <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Total Price</td><td style="padding: 10px 0; color: #111827; font-size: 18px; font-weight: 700;">₹${totalPrice.toLocaleString()}</td></tr>
                            </table>
                        </div>
                        <div style="padding: 16px 24px; background: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">Booking ID: ${bookingId}</p>
                            <p style="margin: 4px 0 0; color: #9ca3af; font-size: 11px;">System Notification</p>
                        </div>
                    </div>
                `,
            });

            if (emailError) {
                console.error('[API] Admin email error:', JSON.stringify(emailError));
            } else {
                console.log('[API] Admin notification sent successfully:', JSON.stringify(emailData));
            }

        } catch (emailCatchError: any) {
            // Don't fail the booking if email fails
            console.error('[API] Email notification failed (booking still saved):', emailCatchError.message, JSON.stringify(emailCatchError));
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
