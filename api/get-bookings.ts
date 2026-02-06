import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

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

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        return response.status(500).json({ error: 'Server configuration error' });
    }

    const client = new Client({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();

        const query = `
      SELECT 
        b.id, 
        c.name as "customerName", 
        c.email, 
        c.phone, 
        b.check_in as "checkIn", 
        b.check_out as "checkOut", 
        r.room_type as "roomType",
        r.id as "roomId",
        r.price
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC
    `;

        const result = await client.query(query);

        // Map to frontend Booking interface
        const bookings = result.rows.map(row => ({
            id: row.id.toString(),
            customerName: row.customerName,
            email: row.email,
            phone: row.phone,
            checkIn: row.checkIn,
            checkOut: row.checkOut,
            roomType: row.roomType,
            roomId: row.roomId ? row.roomId.toString() : 'unknown',
            guests: 2, // Default
            totalAmount: row.price || 0, // Default to room price per night (simplified)
            paymentStatus: 'pending',
            bookingStatus: 'confirmed',
            createdAt: new Date().toISOString() // Mock
        }));

        await client.end();

        return response.status(200).json(bookings);
    } catch (error: any) {
        console.error('Database error:', error);
        try { await client.end(); } catch (e) { }
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
