import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/neon';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Missing start or end date' });
    }

    try {
        const data = await sql`
            SELECT "roomId", date, "isBooked", "bookingId"
            FROM room_availability
            WHERE date >= ${start as string}::date AND date <= ${end as string}::date
        `;

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Calendar API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
