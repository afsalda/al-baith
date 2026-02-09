
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforge } from '../../../lib/insforge';
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

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        if (request.method === 'GET') {
            const { data: bookings, error } = await insforge.database
                .from('bookings')
                .select(`
                    id,
                    checkIn,
                    checkOut,
                    status,
                    bookingTime,
                    createdAt,
                    user:users (
                        name,
                        email,
                        phone
                    ),
                     room:rooms (
                        roomType
                    )
                `)
                .order('createdAt', { ascending: false });

            if (error) {
                console.error('Fetch Bookings Error:', error);
                throw error;
            }

            // Transform data for frontend compatibility
            // Frontend expects: { id, customerName, email, phone, checkIn, checkOut, roomType, bookingStatus, createdAt }
            const transformedBookings = bookings.map((b: any) => ({
                id: b.id,
                customerName: b.user?.name || 'Unknown',
                email: b.user?.email || 'N/A',
                phone: b.user?.phone || 'N/A',
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                roomType: b.room?.roomType || 'Unknown Room',
                bookingTime: b.bookingTime || b.createdAt,
                bookingStatus: b.status || 'pending', // Map 'status' to 'bookingStatus'
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
