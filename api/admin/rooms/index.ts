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
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            const result = await client.query('SELECT * FROM rooms ORDER BY id ASC');
            return response.status(200).json(result.rows);
        }

        if (request.method === 'POST') {
            const { room_type, price, description, image_url } = request.body;

            if (!room_type || !price) {
                return response.status(400).json({ error: 'Room type and price are required' });
            }

            const query = `
                INSERT INTO rooms (room_type, price, description, image_url)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await client.query(query, [room_type, price, description || '', image_url || '']);
            return response.status(201).json(result.rows[0]);
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Rooms API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await client.end();
    }
}
