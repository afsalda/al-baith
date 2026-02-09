import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';
import { insforge } from '../../lib/insforge';
import jwt from 'jsonwebtoken';

// Secret key for JWT - in production this should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'al-baith-admin-secret-key-123';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    let { email, password } = request.body;

    if (email) email = email.trim();
    if (password) password = password.trim();

    console.log('[Login API] Received login attempt:', { email, passwordProvided: !!password }); // Log attempt

    if (!email || !password) {
        return response.status(400).json({ error: 'Email and password are required' });
    }

    // Check InsForge client
    if (!insforge) {
        console.error('InsForge client not initialized');
        return response.status(500).json({ error: 'Database configuration error' });
    }

    try {
        const { data: admins, error } = await insforge.database
            .from('admins')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error('InsForge query error:', error);
            throw error;
        }

        console.log('[Login API] DB Query result count:', admins?.length || 0);

        if (!admins || admins.length === 0) {
            console.log('[Login API] User not found for email:', email);
            return response.status(401).json({ error: 'Invalid credentials (user not found)' });
        }

        const admin = admins[0];
        console.log('[Login API] User found, checking password...');

        // Simple password check (Equality)
        // Note: In production, use hashed passwords!
        if (admin.password_hash !== password) {
            console.log('[Login API] Password mismatch');
            // Check if there is a trimmed mismatch
            if (admin.password_hash.trim() === password.trim()) {
                console.log('[Login API] Password match if trimmed! Potential whitespace issue in DB or request.');
            }
            return response.status(401).json({ error: 'Invalid credentials (password mismatch)' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: admin.id, email: admin.email, name: admin.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return response.status(200).json({
            token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
