import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@insforge/sdk';

// Hardcoded credentials for debugging - will remove after fix confirmed
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
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, phone, email, room_type, check_in, check_out } = req.body;

    if (!name || !phone || !email || !room_type || !check_in || !check_out) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        console.log('[API] New booking request for:', email, room_type);

        const db = insforge.database;

        // 1. Check if user exists
        let userId;
        console.log('[API] Checking user...');
        const { data: users, error: userError } = await db
            .from('users')
            .select('id')
            .eq('email', email);

        if (userError) {
            console.error('[API] User check error:', userError);
            throw userError;
        }

        if (users && users.length > 0) {
            userId = users[0].id;
            console.log('[API] Existing user found:', userId);
        } else {
            console.log('[API] Creating new user...');
            const { data: newUser, error: createError } = await db
                .from('users')
                .insert([
                    {
                        name,
                        email,
                        phone,
                        password: 'guest-pass',
                        role: 'CUSTOMER',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ])
                .select('id')
                .single();

            if (createError) {
                console.error('[API] User creation error:', createError);
                throw createError;
            }
            userId = newUser.id;
            console.log('[API] New user created:', userId);
        }

        // 2. Find the room
        console.log('[API] Finding room type:', room_type);
        const { data: rooms, error: roomError } = await db
            .from('rooms')
            .select('id, price')
            .eq('roomType', room_type)
            .limit(1);

        if (roomError) {
            console.error('[API] Room search error:', roomError);
            throw roomError;
        }

        if (!rooms || rooms.length === 0) {
            console.warn('[API] Room not found:', room_type);
            return res.status(404).json({ error: `Room type '${room_type}' not found.` });
        }
        const roomId = rooms[0].id;
        const price = rooms[0].price;

        // 3. Create the booking
        console.log('[API] Creating booking for room:', roomId);
        const { data: booking, error: bookingError } = await db
            .from('bookings')
            .insert([
                {
                    userId,
                    roomId,
                    checkIn: new Date(check_in).toISOString(),
                    checkOut: new Date(check_out).toISOString(),
                    totalAmount: price,
                    status: 'CONFIRMED',
                    bookingTime: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ])
            .select('id')
            .single();

        if (bookingError) {
            console.error('[API] Booking insert error:', bookingError);
            throw bookingError;
        }
        const bookingId = booking.id;
        console.log('[API] Booking created:', bookingId);

        // 4. Record availability
        console.log('[API] Recording availability...');
        let curr = new Date(check_in);
        const end = new Date(check_out);
        const availabilityRecords = [];

        while (curr < end) {
            availabilityRecords.push({
                roomId,
                date: new Date(curr).toISOString(),
                isBooked: true,
                bookingId
            });
            curr.setDate(curr.getDate() + 1);
        }

        if (availabilityRecords.length > 0) {
            const { error: avError } = await db
                .from('room_availability')
                .upsert(availabilityRecords, { onConflict: 'roomId,date' });

            if (avError) {
                console.error('[API] Availability upsert error:', avError);
                throw avError;
            }
        }

        console.log('[API] Success!');
        return res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            bookingId
        });

    } catch (error: any) {
        console.error('[API] CRITICAL ERROR:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message || 'An unknown error occurred',
            raw: JSON.stringify(error)
        });
    }
}
