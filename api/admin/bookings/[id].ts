import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
import { verifyToken, handleAuthError } from '../../utils/auth.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
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

    const { id } = request.query;

    if (!id || Array.isArray(id)) {
        return response.status(400).json({ error: 'Invalid ID' });
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();

        if (request.method === 'PUT') {
            const { status } = request.body;

            if (!status) {
                return response.status(400).json({ error: 'Status is required' });
            }

            const query = `
                UPDATE bookings 
                SET status = $1
                WHERE id = $2
                RETURNING *
            `;
            const result = await client.query(query, [status, id]);

            if (result.rows.length === 0) {
                return response.status(404).json({ error: 'Booking not found' });
            }

            return response.status(200).json(result.rows[0]);
        }

        if (request.method === 'DELETE') {
            const query = 'DELETE FROM bookings WHERE id = $1 RETURNING *';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return response.status(404).json({ error: 'Booking not found' });
            }
            return response.status(200).json({ message: 'Booking deleted successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Booking Details API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await client.end();
    }
}
