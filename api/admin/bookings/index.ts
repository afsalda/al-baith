
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../../lib/neon';
import { verifyToken, handleAuthError } from '../../_lib/auth.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    // Auth Check
    const user = verifyToken(request);
    if (!user) {
        return handleAuthError(response);
    }

    try {
        if (request.method === 'GET') {
            const bookings = await sql`
                SELECT 
                    b.id,
                    b."checkIn",
                    b."checkOut",
                    b.status,
                    b."totalAmount",
                    b."bookingTime",
                    b."createdAt",
                    u.name AS user_name,
                    u.email AS user_email,
                    u.phone AS user_phone,
                    r."roomType" AS room_type
                FROM bookings b
                LEFT JOIN users u ON b."userId" = u.id
                LEFT JOIN rooms r ON b."roomId" = r.id
                ORDER BY b."createdAt" DESC
            `;

            // Transform data for frontend compatibility
            const transformedBookings = bookings.map((b: any) => ({
                id: b.id,
                customerName: b.user_name || 'Unknown',
                email: b.user_email || 'N/A',
                phone: b.user_phone || 'N/A',
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                roomType: b.room_type || 'Unknown Room',
                bookingTime: b.bookingTime || b.createdAt,
                bookingStatus: b.status || 'pending',
                createdAt: b.createdAt
            }));

            return response.status(200).json(transformedBookings);
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Bookings API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
