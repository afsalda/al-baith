import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        return response.status(500).json({ error: 'DATABASE_URL is not defined' });
    }

    const client = new Client({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();

        // 1. Create Tables if they don't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_type VARCHAR(50) NOT NULL UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        room_id INTEGER REFERENCES rooms(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Seed Rooms
        const rooms = [
            { type: 'Suite Room', price: 2500 },
            { type: 'Deluxe', price: 1800 },
            { type: 'Standard', price: 1500 },
            { type: 'Apartment', price: 3500 },
            // Add variations just in case
            { type: 'Deluxe Room', price: 1800 },
            { type: 'Standard Room', price: 1500 }
        ];

        let insertedCount = 0;
        for (const room of rooms) {
            const check = await client.query('SELECT id FROM rooms WHERE room_type = $1', [room.type]);
            if (check.rows.length === 0) {
                await client.query('INSERT INTO rooms (room_type, price) VALUES ($1, $2)', [room.type, room.price]);
                insertedCount++;
            }
        }

        await client.end();

        return response.status(200).json({
            message: 'Database initialized successfully',
            tablesCreated: true,
            roomsSeeded: insertedCount
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        try { await client.end(); } catch (e) { }
        return response.status(500).json({ error: 'Migration failed', details: error.message });
    }
}
