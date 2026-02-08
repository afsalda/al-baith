import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('pg'); // Use require for pg to avoid Vite SSR issues
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

    // Allow public GET? Or only admin?
    // User requirement: "Hotel Settings (CRUD)" in Admin Panel.
    // Usually settings are needed for the frontend (Footer contact info).
    // So GET should be public, PUT should be admin-only.
    // Let's check token only for PUT.

    let user = null;
    if (request.method !== 'GET') {
        user = verifyToken(request);
        if (!user) {
            return handleAuthError(response);
        }
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();

        if (request.method === 'GET') {
            const result = await client.query('SELECT key, value FROM settings');
            // Transform array to object for easier consumption { key: value }
            const settings = result.rows.reduce((acc: any, row: any) => {
                acc[row.key] = row.value;
                return acc;
            }, {});
            return response.status(200).json(settings);
        }

        if (request.method === 'PUT') {
            const settings = request.body; // Expect { key: value, key2: value2 }

            // We loop through keys and update them
            const keys = Object.keys(settings);

            for (const key of keys) {
                // Upsert logic
                await client.query(`
                    INSERT INTO settings (key, value)
                    VALUES ($1, $2)
                    ON CONFLICT (key) 
                    DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
                `, [key, settings[key]]);
            }

            return response.status(200).json({ message: 'Settings updated successfully' });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Settings API Error:', error);
        return response.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
        await client.end();
    }
}
