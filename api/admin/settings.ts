
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/neon';
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

    try {
        if (request.method === 'GET') {
            const settings = await sql`SELECT key, value FROM settings`;

            // Transform array to object { key: value }
            const result = (settings || []).reduce((acc: any, row: any) => {
                acc[row.key] = row.value;
                return acc;
            }, {});

            return response.status(200).json(result);
        }

        if (request.method === 'PUT') {
            const settingsBody = request.body; // Expect { key: value, key2: value2 }

            const keys = Object.keys(settingsBody);
            for (const key of keys) {
                await sql`
                    INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${settingsBody[key]}, NOW())
                    ON CONFLICT (key) DO UPDATE SET value = ${settingsBody[key]}, updated_at = NOW()
                `;
            }

            return response.status(200).json({ message: 'Settings updated successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Settings API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
