
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforge } from '../lib/insforge';

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

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        const { data: bookings, error } = await insforge.database
            .from('bookings')
            .select(`
                id,
                checkIn,
                checkOut,
                status,
                totalAmount,
                bookingTime,
                createdAt,
                user:users (
                    name,
                    email,
                    phone
                ),
                room:rooms (
                    id,
                    roomType,
                    price
                )
            `)
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Fetch Bookings Error:', error);
            throw error;
        }

        // Map to frontend interface
        const transformedBookings = (bookings || []).map((b: any) => ({
            id: b.id.toString(),
            customerName: b.user?.name || 'Unknown',
            email: b.user?.email || 'N/A',
            phone: b.user?.phone || 'N/A',
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            roomType: b.room?.roomType || 'Unknown Room',
            roomId: b.room?.id ? b.room.id.toString() : 'unknown',
            guests: 2, // Minimal data
            totalAmount: b.totalAmount || b.room?.price || 0,
            paymentStatus: 'paid', // Hardcoded as placeholder
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
