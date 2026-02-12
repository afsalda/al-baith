import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@insforge/sdk';

const INSFORGE_URL = 'https://i8m3i9mq.us-west.insforge.app';
const INSFORGE_KEY = 'ik_193e152f1386d1beed3ac3af245345b01773d53da044715f726c94493c64ada3';

const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_KEY,
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Basic Auth Check (Token verification should be robust in prod)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Missing start or end date' });
    }

    try {
        const db = insforge.database;

        const { data, error } = await db
            .from('room_availability')
            .select('roomId, date, isBooked, bookingId')
            .gte('date', start as string)
            .lte('date', end as string);

        if (error) throw error;

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Calendar API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
