
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/neon';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
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
                r.id AS room_id,
                r."roomType" AS room_type,
                r.price AS room_price
            FROM bookings b
            LEFT JOIN users u ON b."userId" = u.id
            LEFT JOIN rooms r ON b."roomId" = r.id
            ORDER BY b."createdAt" DESC
        `;

        // Map to frontend interface
        const transformedBookings = (bookings || []).map((b: any) => ({
            id: b.id.toString(),
            customerName: b.user_name || 'Unknown',
            email: b.user_email || 'N/A',
            phone: b.user_phone || 'N/A',
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            roomType: b.room_type || 'Unknown Room',
            roomId: b.room_id ? b.room_id.toString() : 'unknown',
            guests: 2,
            totalAmount: b.totalAmount || b.room_price || 0,
            paymentStatus: 'paid',
            bookingStatus: b.status || 'pending',
            bookingTime: b.bookingTime || b.createdAt,
            createdAt: b.createdAt
        }));

        return response.status(200).json(transformedBookings);
    } catch (error: any) {
        console.error('Fetch Bookings API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
