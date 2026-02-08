import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
const { Client } = pg;

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

    const connectionString = "postgresql://neondb_owner:npg_1jGmLdRfwl8X@ep-flat-shape-aib20yxl-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require";
    const client = new Client({ connectionString });

    try {
        await client.connect();
        await client.query('BEGIN');

        // 1. Check if user exists
        let userId;
        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].id;
        } else {
            const newUserRes = await client.query(
                `INSERT INTO users (id, name, email, password, "role", "createdAt", "updatedAt") 
                 VALUES (gen_random_uuid()::text, $1, $2, $3, 'CUSTOMER'::"Role", NOW(), NOW()) 
                 RETURNING id`,
                [name, email, 'guest-pass']
            );
            userId = newUserRes.rows[0].id;
        }

        // 2. Find the room
        const roomRes = await client.query('SELECT id, price FROM rooms WHERE "roomType" = $1 LIMIT 1', [room_type]);
        if (roomRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Room type '${room_type}' not found.` });
        }
        const roomId = roomRes.rows[0].id;
        const price = roomRes.rows[0].price;

        // 3. Create the booking
        const bookingRes = await client.query(
            `INSERT INTO bookings (id, "userId", "roomId", "checkIn", "checkOut", "totalAmount", "status", "createdAt", "updatedAt") 
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 'CONFIRMED'::"BookingStatus", NOW(), NOW()) 
             RETURNING id`,
            [userId, roomId, new Date(check_in), new Date(check_out), price]
        );
        const bookingId = bookingRes.rows[0].id;

        // 4. Record availability
        let curr = new Date(check_in);
        const end = new Date(check_out);
        while (curr < end) {
            await client.query(
                `INSERT INTO room_availability (id, "roomId", "date", "isBooked", "bookingId") 
                 VALUES (gen_random_uuid()::text, $1, $2, true, $3)
                 ON CONFLICT ("roomId", "date") DO UPDATE SET "isBooked" = true, "bookingId" = $3`,
                [roomId, new Date(curr), bookingId]
            );
            curr.setDate(curr.getDate() + 1);
        }

        await client.query('COMMIT');
        await client.end();

        return res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            bookingId
        });

    } catch (error: any) {
        if (client) {
            await client.query('ROLLBACK').catch(() => { });
            await client.end().catch(() => { });
        }
        console.error('DATABASE_ERROR_DETAILED:', error);
        return res.status(500).json({
            error: 'Database error',
            details: error.message,
            code: error.code
        });
    }
}
