import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
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

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();

        if (request.method === 'GET') {
            // Join bookings with customers and rooms to get full details
            const query = `
                SELECT 
                    b.id,
                    c.name as "customerName",
                    c.email,
                    c.phone,
                    b.check_in as "checkIn",
                    b.check_out as "checkOut",
                    r.room_type as "roomType",
                    b.room_id as "roomId",
                    b.status as "bookingStatus",
                    b.created_at as "createdAt"
                FROM bookings b
                JOIN customers c ON b.customer_id = c.id
                JOIN rooms r ON b.room_id = r.id
                ORDER BY b.created_at DESC
            `;
            const result = await client.query(query);
            return response.status(200).json(result.rows);
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Bookings API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await client.end();
    }
}
