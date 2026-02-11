import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const booking = req.body;

        const { data, error } = await resend.emails.send({
            from: 'Al-Baith Resort <onboarding@resend.dev>',
            to: 'albaith.booking@gmail.com',
            subject: `🏨 New Booking - ${booking.name}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🏨 Al-Baith Resort</h1>
                        <p style="color: #93c5fd; margin: 8px 0 0; font-size: 14px;">New Booking Confirmation</p>
                    </div>

                    <!-- Body -->
                    <div style="padding: 32px 24px;">
                        <h2 style="color: #1e3a5f; font-size: 20px; margin: 0 0 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                            Booking Details
                        </h2>

                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 140px;">Guest Name</td>
                                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${booking.name}</td>
                            </tr>
                            <tr style="background: #f9fafb;">
                                <td style="padding: 10px 8px; color: #6b7280; font-size: 14px; border-radius: 6px 0 0 6px;">Email</td>
                                <td style="padding: 10px 8px; color: #111827; font-size: 14px; border-radius: 0 6px 6px 0;">${booking.email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Phone</td>
                                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${booking.phone}</td>
                            </tr>
                            <tr style="background: #f9fafb;">
                                <td style="padding: 10px 8px; color: #6b7280; font-size: 14px; border-radius: 6px 0 0 6px;">Room Type</td>
                                <td style="padding: 10px 8px; color: #111827; font-size: 14px; font-weight: 600; border-radius: 0 6px 6px 0;">${booking.roomType || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Check-in</td>
                                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">📅 ${booking.checkIn}</td>
                            </tr>
                            <tr style="background: #f9fafb;">
                                <td style="padding: 10px 8px; color: #6b7280; font-size: 14px; border-radius: 6px 0 0 6px;">Check-out</td>
                                <td style="padding: 10px 8px; color: #111827; font-size: 14px; font-weight: 600; border-radius: 0 6px 6px 0;">📅 ${booking.checkOut}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Guests</td>
                                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${booking.guests || 'N/A'}</td>
                            </tr>
                        </table>

                        <!-- Total Amount -->
                        <div style="margin-top: 24px; padding: 16px 20px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 10px; border-left: 4px solid #2563eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</p>
                            <p style="margin: 4px 0 0; color: #1e3a5f; font-size: 28px; font-weight: 700;">₹${booking.totalPrice || booking.totalAmount || '0'}</p>
                        </div>

                        ${booking.specialRequests ? `
                        <div style="margin-top: 20px; padding: 14px 18px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Special Requests</p>
                            <p style="margin: 6px 0 0; color: #78350f; font-size: 14px;">${booking.specialRequests}</p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Footer -->
                    <div style="padding: 20px 24px; background: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">Booking ID: ${booking.id || 'N/A'}</p>
                        <p style="margin: 6px 0 0; color: #9ca3af; font-size: 11px;">This is an automated notification from Al-Baith Resort booking system.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('[Email] Resend error:', error);
            return res.status(400).json({ error });
        }

        console.log('[Email] Sent successfully:', data);
        return res.status(200).json({ success: true, data });

    } catch (error: any) {
        console.error('[Email] Critical error:', error);
        return res.status(500).json({ error: error.message });
    }
}
