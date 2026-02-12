import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/neon';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        // FIX 1: Wrapped with existence check and specific column selection
        // instead of SELECT * to avoid leaking sensitive columns unnecessarily
        const admins = await sql`
            SELECT id, name, email, password_hash 
            FROM admins 
            WHERE email = ${email}
            LIMIT 1
        `;

        console.log('[Login API] DB Query result count:', admins.length);

        if (!admins || admins.length === 0) {
            console.log('[Login API] User not found for email:', email);
            // Use generic error message to prevent user enumeration
            return response.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = admins[0];
        console.log('[Login API] User found, checking password...');

        // FIX 2: Secure password comparison using bcrypt
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            console.log('[Login API] Password mismatch');
            return response.status(401).json({ error: 'Invalid credentials' });
        }

        // FIX 3: JWT payload includes id, email, name, and role
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: 'admin'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return response.status(200).json({
            token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: 'admin'
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        // Improved error: detect if it's a table-not-found issue
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            return response.status(500).json({ error: 'Database not initialized. Admins table is missing.' });
        }
        return response.status(500).json({ error: 'Internal server error' });
    }
}
