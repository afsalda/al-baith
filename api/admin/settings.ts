
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforge } from '../../lib/insforge';
import { verifyToken, handleAuthError } from '../_lib/auth.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    let user = null;
    if (request.method !== 'GET') {
        user = verifyToken(request);
        if (!user) {
            return handleAuthError(response);
        }
    }

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        if (request.method === 'GET') {
            const { data, error } = await insforge.database
                .from('settings')
                .select('key, value');

            if (error) throw error;

            // Transform array to object for easier consumption { key: value }
            const settings = (data || []).reduce((acc: any, row: any) => {
                acc[row.key] = row.value;
                return acc;
            }, {});

            return response.status(200).json(settings);
        }

        if (request.method === 'PUT') {
            const settings = request.body; // Expect { key: value, key2: value2 }

            // InsForge (PostgREST) supports bulk upsert
            // Transform object to array of { key, value }
            const updates = Object.keys(settings).map(key => ({
                key,
                value: settings[key],
                updated_at: new Date().toISOString()
            }));

            if (updates.length > 0) {
                const { error } = await insforge.database
                    .from('settings')
                    .upsert(updates, { onConflict: 'key' });

                if (error) throw error;
            }

            return response.status(200).json({ message: 'Settings updated successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Settings API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
