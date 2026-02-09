
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

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        if (request.method === 'PUT') {
            const { status } = request.body;

            if (!status) {
                return response.status(400).json({ error: 'Status is required' });
            }

            // Map status to uppercase if needed by DB enum
            const formattedStatus = status.toUpperCase();

            const { data, error } = await insforge.database
                .from('bookings')
                .update({
                    status: formattedStatus,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Update Booking Error:', error);
                throw error;
            }

            if (!data) {
                return response.status(404).json({ error: 'Booking not found' });
            }

            return response.status(200).json(data);
        }

        if (request.method === 'DELETE') {
            const { error, data } = await insforge.database
                .from('bookings')
                .delete()
                .eq('id', id)
                .select();

            if (error) {
                console.error('Delete Booking Error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
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
