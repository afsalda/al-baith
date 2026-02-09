import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforge } from '../lib/insforge';

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

    if (!insforge) {
        console.error('InsForge client not initialized');
        return res.status(500).json({ error: 'Database configuration error' });
    }

    try {
        // 1. Check if user exists
        let userId;
        const { data: users, error: userError } = await insforge.database
            .from('users')
            .select('id')
            .eq('email', email);

        if (userError) throw userError;

        if (users && users.length > 0) {
            userId = users[0].id;
        } else {
            const { data: newUser, error: createError } = await insforge.database
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

            if (createError) throw createError;
            userId = newUser.id;
        }

        // 2. Find the room
        const { data: rooms, error: roomError } = await insforge.database
            .from('rooms')
            .select('id, price')
            .eq('roomType', room_type)
            .limit(1);

        if (roomError) throw roomError;

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ error: `Room type '${room_type}' not found.` });
        }
        const roomId = rooms[0].id;
        const price = rooms[0].price;

        // 3. Create the booking
        const { data: booking, error: bookingError } = await insforge.database
            .from('bookings')
            .insert([
                {
                    userId,
                    roomId,
                    checkIn: new Date(check_in).toISOString(),
                    checkOut: new Date(check_out).toISOString(),
                    totalAmount: price, // Note: Logic should might need multiplier by days, but keeping as is per original code
                    status: 'CONFIRMED',
                    bookingTime: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ])
            .select('id')
            .single();

        if (bookingError) throw bookingError;
        const bookingId = booking.id;

        // 4. Record availability (Loop)
        // InsForge/Supabase SDK supports bulk insert which is better
        let curr = new Date(check_in);
        const end = new Date(check_out);
        const availabilityRecords = [];

        while (curr < end) {
            availabilityRecords.push({
                roomId,
                date: new Date(curr).toISOString(), // Ensure date format matches DB
                isBooked: true,
                bookingId
            });
            curr.setDate(curr.getDate() + 1);
        }

        if (availabilityRecords.length > 0) {
            const { error: avError } = await insforge.database
                .from('room_availability')
                .upsert(availabilityRecords, { onConflict: 'roomId,date' }); // Ensure unique constraint exists

            if (avError) throw avError;
        }

        return res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            bookingId
        });

    } catch (error: any) {
        console.error('db_error:', error);
        return res.status(500).json({
            error: 'Database error',
            details: error.message,
            code: error.code
        });
    }
}
