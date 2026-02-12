import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/neon';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { roomId, date, shouldBlock } = req.body;

    if (!roomId || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        if (shouldBlock) {
            // Block the date (Manual block: bookingId is null)
            await sql`
                INSERT INTO room_availability ("roomId", date, "isBooked", "bookingId")
                VALUES (${roomId}, ${date}::date, true, NULL)
                ON CONFLICT ("roomId", date) DO UPDATE SET "isBooked" = true
            `;
        } else {
            // Unblock (Only delete manual blocks where bookingId IS NULL)
            await sql`
                DELETE FROM room_availability
                WHERE "roomId" = ${roomId} AND date = ${date}::date AND "bookingId" IS NULL
            `;
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Toggle Block API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
