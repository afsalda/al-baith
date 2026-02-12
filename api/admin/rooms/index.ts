
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

    try {
        if (request.method === 'GET') {
            const rooms = await sql`SELECT * FROM rooms ORDER BY "createdAt" ASC`;
            return response.status(200).json(rooms);
        }

        if (request.method === 'POST') {
            const { room_type, price, description, image_url, capacity } = request.body;

            if (!room_type || !price) {
                return response.status(400).json({ error: 'Room type and price are required' });
            }

            // Get default hotel
            let hotels = await sql`SELECT id FROM hotels LIMIT 1`;
            let hotelId;

            if (hotels.length > 0) {
                hotelId = hotels[0].id;
            } else {
                const newHotel = await sql`
                    INSERT INTO hotels (name, address, city)
                    VALUES ('Al-Baith Resthouse', 'Default Address', 'Default City')
                    RETURNING id
                `;
                hotelId = newHotel[0].id;
            }

            const newRoom = await sql`
                INSERT INTO rooms ("hotelId", "roomType", price, description, image_url, capacity, "createdAt", "updatedAt")
                VALUES (${hotelId}, ${room_type}, ${price}, ${description || ''}, ${image_url || ''}, ${capacity || 2}, NOW(), NOW())
                RETURNING *
            `;

            return response.status(201).json(newRoom[0]);
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Rooms API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
