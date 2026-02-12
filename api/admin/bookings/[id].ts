
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

    try {
        if (request.method === 'PUT') {
            const { status } = request.body;

            if (!status) {
                return response.status(400).json({ error: 'Status is required' });
            }

            const formattedStatus = status.toUpperCase();

            const result = await sql`
                UPDATE bookings SET status = ${formattedStatus}, "updatedAt" = NOW()
                WHERE id = ${id}
                RETURNING *
            `;

            if (result.length === 0) {
                return response.status(404).json({ error: 'Booking not found' });
            }

            return response.status(200).json(result[0]);
        }

        if (request.method === 'DELETE') {
            // First delete related room_availability records
            await sql`DELETE FROM room_availability WHERE "bookingId" = ${id}`;

            const result = await sql`DELETE FROM bookings WHERE id = ${id} RETURNING id`;

            if (result.length === 0) {
                return response.status(404).json({ error: 'Booking not found' });
            }

            return response.status(200).json({ message: 'Booking deleted successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Booking Details API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
