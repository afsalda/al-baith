
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

    try {
        if (request.method === 'PUT') {
            const { room_type, price, description, image_url, capacity } = request.body;

            // Build dynamic SET clause
            const updates: string[] = [];
            const values: any[] = [];

            if (room_type !== undefined) { updates.push(`"roomType" = $${updates.length + 1}`); values.push(room_type); }
            if (price !== undefined) { updates.push(`price = $${updates.length + 1}`); values.push(price); }
            if (description !== undefined) { updates.push(`description = $${updates.length + 1}`); values.push(description); }
            if (image_url !== undefined) { updates.push(`image_url = $${updates.length + 1}`); values.push(image_url); }
            if (capacity !== undefined) { updates.push(`capacity = $${updates.length + 1}`); values.push(capacity); }
            updates.push(`"updatedAt" = NOW()`);

            if (values.length === 0) {
                return response.status(400).json({ error: 'No fields to update' });
            }

            // Use tagged template with individual fields since dynamic SQL is tricky with neon
            const result = await sql`
                UPDATE rooms SET
                    "roomType" = COALESCE(${room_type ?? null}, "roomType"),
                    price = COALESCE(${price ?? null}, price),
                    description = COALESCE(${description ?? null}, description),
                    image_url = COALESCE(${image_url ?? null}, image_url),
                    capacity = COALESCE(${capacity ?? null}, capacity),
                    "updatedAt" = NOW()
                WHERE id = ${id}
                RETURNING *
            `;

            if (result.length === 0) {
                return response.status(404).json({ error: 'Room not found' });
            }

            return response.status(200).json(result[0]);
        }

        if (request.method === 'DELETE') {
            const result = await sql`DELETE FROM rooms WHERE id = ${id} RETURNING id`;

            if (result.length === 0) {
                return response.status(404).json({ error: 'Room not found (or already deleted)' });
            }

            return response.status(200).json({ message: 'Room deleted successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Room Details API Error:', error);
        // Check for foreign key violation
        if (error.code === '23503') {
            return response.status(400).json({ error: 'Cannot delete room with existing bookings' });
        }
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
