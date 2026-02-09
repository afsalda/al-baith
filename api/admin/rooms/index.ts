
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

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        if (request.method === 'GET') {
            const { data, error } = await insforge.database
                .from('rooms')
                .select('*')
                .order('createdAt', { ascending: true }); // Order by creation since ID is UUID

            if (error) throw error;
            return response.status(200).json(data);
        }

        if (request.method === 'POST') {
            const { room_type, price, description, image_url, capacity } = request.body;

            if (!room_type || !price) {
                return response.status(400).json({ error: 'Room type and price are required' });
            }

            // Get default hotel ID or assume one exists (using the seeded one or similar)
            // Ideally we'd pass hotelId, but for simplicity let's find one or use first one
            const { data: hotels } = await insforge.database.from('hotels').select('id').limit(1);
            let hotelId = hotels && hotels.length > 0 ? hotels[0].id : null;

            // If no hotel, create a default one (fallback)
            if (!hotelId) {
                // Try to create dummy hotel if missing
                const { data: newHotel, error: hError } = await insforge.database
                    .from('hotels')
                    .insert([{
                        name: 'Al-Baith Resthouse',
                        address: 'Default Address',
                        city: 'Default City',
                        ownerId: user.id // Use current admin as owner
                    }])
                    .select('id')
                    .single();
                if (hError) {
                    console.warn('Could not create default hotel:', hError);
                    // Abort if no hotel
                    return response.status(500).json({ error: 'No hotel found to link room to.' });
                }
                hotelId = newHotel.id;
            }

            const { data, error } = await insforge.database
                .from('rooms')
                .insert([
                    {
                        hotelId,
                        roomType: room_type,
                        price,
                        description: description || '',
                        image_url: image_url || '',
                        capacity: capacity || 2, // Default capacity
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Create Room Error:', error);
                throw error;
            }

            return response.status(201).json(data);
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Rooms API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
