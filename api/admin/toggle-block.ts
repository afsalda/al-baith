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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { roomId, date, shouldBlock } = req.body;

    if (!roomId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // date can be single string or array if blocking multiple dates? Assume single string for now or loop.
    // Ideally accept 'dates' array but Calendar clicks are single.

    // Safety: ensure date is provided
    if (!date) {
        return res.status(400).json({ error: 'Missing date' });
    }

    try {
        const db = insforge.database;

        if (shouldBlock) {
            // Block the date (Manual Block: bookingId is null)
            // Use ISO string for date if possible, ensure format matches existing records
            const { error } = await db
                .from('room_availability')
                .upsert({
                    roomId,
                    date,
                    isBooked: true,
                    bookingId: null
                }, { onConflict: 'roomId,date' });

            if (error) {
                console.error('Block Error:', error);
                throw error;
            }
        } else {
            // Unblock (Delete the manual booking)
            // Safety: Only delete if bookingId is NULL. Do NOT delete confirmed bookings.
            const { error } = await db
                .from('room_availability')
                .delete()
                .eq('roomId', roomId)
                .eq('date', date)
                .is('bookingId', null);

            if (error) {
                console.error('Unblock Error:', error);
                throw error;
            }
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Toggle Block API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
