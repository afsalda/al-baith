const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seed() {
    // Read .env.local manually
    const envPath = path.join(__dirname, '.env.local');
    let connectionString = '';

    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL="([^"]+)"/);
        if (match && match[1]) {
            connectionString = match[1];
        }
    } catch (e) {
        console.error('Could not read .env.local');
    }

    if (!connectionString || connectionString.includes('YOUR_PASSWORD_HERE')) {
        console.error('Error: Please update .env.local with your real PostgreSQL password.');
        console.error('Current DATABASE_URL:', connectionString);
        process.exit(1);
    }

    console.log('Connecting to:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

    const client = new Client({
        connectionString,
        ssl: false // Localhost usually doesn't use SSL
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Create Tables
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
        console.log('Tables created.');

        // 2. Seed Rooms
        const rooms = [
            { type: 'Suite Room', price: 2500 },
            { type: 'Deluxe', price: 1800 },
            { type: 'Standard', price: 1500 },
            { type: 'Apartment', price: 3500 },
            { type: 'Deluxe Room', price: 1800 },
            { type: 'Standard Room', price: 1500 },
            { type: '1 BHK Apartment', price: 4500 },
            { type: '2 BHK Apartment', price: 5500 },
            { type: '3 BHK Apartment', price: 7500 }
        ];

        for (const room of rooms) {
            // Upsert logic
            const check = await client.query('SELECT id FROM rooms WHERE room_type = $1', [room.type]);
            if (check.rows.length === 0) {
                await client.query('INSERT INTO rooms (room_type, price) VALUES ($1, $2)', [room.type, room.price]);
                console.log(`Inserted room: ${room.type}`);
            } else {
                console.log(`Room already exists: ${room.type}`);
            }
        }

        console.log('Database seeded successfully!');
        await client.end();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('\n--> ACTION REQUIRED: The password in .env.local is incorrect. Please update it.');
        }
        process.exit(1);
    }
}

seed();
