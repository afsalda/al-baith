
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforge } from '../../../lib/insforge';
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

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        if (request.method === 'PUT') {
            const { room_type, price, description, image_url, capacity } = request.body;

            // Build update object with only provided fields
            const updates: any = {};
            // Map incoming 'room_type' to 'roomType' column
            if (room_type !== undefined) updates.roomType = room_type;
            if (price !== undefined) updates.price = price;
            if (description !== undefined) updates.description = description;
            if (image_url !== undefined) updates.image_url = image_url;
            if (capacity !== undefined) updates.capacity = capacity;

            updates.updatedAt = new Date().toISOString();

            const { data, error } = await insforge.database
                .from('rooms')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Update Room Error:', error);
                throw error;
            }

            if (!data) {
                return response.status(404).json({ error: 'Room not found' });
            }

            return response.status(200).json(data);
        }

        if (request.method === 'DELETE') {
            const { error, data } = await insforge.database
                .from('rooms')
                .delete()
                .eq('id', id)
                .select(); // Select to check if deleted

            if (error) {
                // Check for foreign key violation (usually error code 23503 in postgres)
                if (error.code === '23503') {
                    return response.status(400).json({ error: 'Cannot delete room with existing bookings' });
                }
                console.error('Delete Room Error:', error);
                throw error;
            }

            // Check if any row was returned (meaning deleted)
            if (!data || data.length === 0) {
                return response.status(404).json({ error: 'Room not found (or already deleted)' });
            }

            return response.status(200).json({ message: 'Room deleted successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Room Details API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
