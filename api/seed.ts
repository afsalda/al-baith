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

    const connectionString = "postgresql://neondb_owner:npg_1jGmLdRfwl8X@ep-flat-shape-aib20yxl-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require";
    const client = new Client({ connectionString });

    try {
        await client.connect();

        console.log('Seed: Starting database initialization...');

        // 1. Seed Admin User
        await client.query(`
            INSERT INTO users (id, name, email, password, "role", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, 'System Admin', 'admin@al-baith.com', 'admin-pass', 'ADMIN'::"Role", NOW(), NOW())
            ON CONFLICT (email) DO NOTHING
        `);

        const adminRes = await client.query("SELECT id FROM users WHERE \"role\" = 'ADMIN'::\"Role\" LIMIT 1");
        const adminId = adminRes.rows[0].id;

        // 2. Seed Hotel (Check existence first to avoid ON CONFLICT error on non-unique name)
        const hotelCheck = await client.query("SELECT id FROM hotels LIMIT 1");
        let hotelId;
        if (hotelCheck.rows.length === 0) {
            const newHotel = await client.query(`
                INSERT INTO hotels (id, name, address, city, "ownerId", "createdAt", "updatedAt")
                VALUES (gen_random_uuid()::text, 'Al-Baith Executive', '123 Luxury Road', 'New Delhi', $1, NOW(), NOW())
                RETURNING id
            `, [adminId]);
            hotelId = newHotel.rows[0].id;
        } else {
            hotelId = hotelCheck.rows[0].id;
        }

        // 3. Seed Rooms (Check existence by roomType)
        const roomTypes = [
            { type: 'Standard Room', price: 99.00, cap: 2 },
            { type: 'Deluxe Room', price: 144.00, cap: 2 },
            { type: 'Executive Suite', price: 249.00, cap: 3 },
            { type: 'Family Suite', price: 349.00, cap: 5 }
        ];

        for (const r of roomTypes) {
            const roomCheck = await client.query('SELECT id FROM rooms WHERE "roomType" = $1', [r.type]);
            if (roomCheck.rows.length === 0) {
                await client.query(`
                    INSERT INTO rooms (id, "hotelId", "roomType", price, capacity, "createdAt", "updatedAt")
                    VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
                `, [hotelId, r.type, r.price, r.cap]);
            }
        }

        await client.end();
        return res.status(200).json({
            success: true,
            message: 'Database initialization successful. Using existence checks instead of non-unique ON CONFLICT clauses.'
        });

    } catch (error: any) {
        if (client) await client.end().catch(() => { });
        console.error('SEED_ERROR_DETAILED:', error);
        return res.status(500).json({ error: error.message });
    }
}
