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
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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
            const { room_type, price, description, image_url } = request.body;

            const query = `
                UPDATE rooms 
                SET room_type = COALESCE($1, room_type),
                    price = COALESCE($2, price),
                    description = COALESCE($3, description),
                    image_url = COALESCE($4, image_url)
                WHERE id = $5
                RETURNING *
            `;
            const result = await client.query(query, [room_type, price, description, image_url, id]);

            if (result.rows.length === 0) {
                return response.status(404).json({ error: 'Room not found' });
            }

            return response.status(200).json(result.rows[0]);
        }

        if (request.method === 'DELETE') {
            // Check for bookings first?
            // For now, simple delete. DB foreign key constraint might fail if there are bookings.
            // Ideally we should soft delete or check constraints, but user asked for simple delete.
            // If foreign key constraint exists (it does), this will fail if bookings exist.

            try {
                const query = 'DELETE FROM rooms WHERE id = $1 RETURNING *';
                const result = await client.query(query, [id]);

                if (result.rows.length === 0) {
                    return response.status(404).json({ error: 'Room not found' });
                }
                return response.status(200).json({ message: 'Room deleted successfully' });
            } catch (fkError: any) {
                if (fkError.code === '23503') { // Foreign key violation
                    return response.status(400).json({ error: 'Cannot delete room with existing bookings' });
                }
                throw fkError;
            }
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Room Details API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await client.end();
    }
}
