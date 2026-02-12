import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/neon';
import jwt from 'jsonwebtoken';

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

    console.log('[Login API] Received login attempt:', { email, passwordProvided: !!password });

    if (!email || !password) {
        return response.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const admins = await sql`SELECT * FROM admins WHERE email = ${email}`;

        console.log('[Login API] DB Query result count:', admins.length);

        if (admins.length === 0) {
            console.log('[Login API] User not found for email:', email);
            return response.status(401).json({ error: 'Invalid credentials (user not found)' });
        }

        const admin = admins[0];
        console.log('[Login API] User found, checking password...');

        if (admin.password_hash !== password) {
            console.log('[Login API] Password mismatch');
            if (admin.password_hash.trim() === password.trim()) {
                console.log('[Login API] Password match if trimmed!');
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
