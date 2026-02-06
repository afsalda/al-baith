import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { name, phone, email, room_type, check_in, check_out } = request.body;
    console.log('Received booking request:', { name, room_type, check_in, check_out });

    if (!name || !phone || !email || !room_type || !check_in || !check_out) {
        console.error('Missing required fields');
        return response.status(400).json({ error: 'Missing required fields' });
    }

    // Use connection string for database
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL is not defined in process.env');
        return response.status(500).json({ error: 'Server configuration error: DATABASE_URL missing' });
    }

    const client = new Client({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Connected to database successfully');

        // 1. Insert customer and get ID
        const insertCustomerQuery = `
      INSERT INTO customers (name, phone, email) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `;
        const customerResult = await client.query(insertCustomerQuery, [name, phone, email]);
        const customerId = customerResult.rows[0].id;

        // 2. Find room_id from room_type
        const findRoomQuery = `SELECT id FROM rooms WHERE room_type = $1`;
        const roomResult = await client.query(findRoomQuery, [room_type]);

        if (roomResult.rows.length === 0) {
            throw new Error(`Room type '${room_type}' not found`);
        }
        const roomId = roomResult.rows[0].id;

        // 3. Insert booking
        const insertBookingQuery = `
      INSERT INTO bookings (customer_id, room_id, check_in, check_out)
      VALUES ($1, $2, $3, $4)
    `;
        await client.query(insertBookingQuery, [customerId, roomId, check_in, check_out]);

        await client.end();

        return response.status(200).json({ message: 'Booking successful' });
    } catch (error: any) {
        console.error('Database error:', error);
        try {
            await client.end();
        } catch (e) {
            // ignore disconnect error
        }
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
