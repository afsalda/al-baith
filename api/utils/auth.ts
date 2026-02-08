import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'al-baith-admin-secret-key-123';

export function verifyToken(request: VercelRequest): any {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return null; // No token
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null; // Invalid token
    }
}

export function handleAuthError(response: VercelResponse) {
    return response.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
}
