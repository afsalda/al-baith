import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugBookings() {
    const envPath = path.join(__dirname, '..', '.env.local');
    let connectionString = '';

    try {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/DATABASE_URL="([^"]+)"/);
            if (match && match[1]) {
                connectionString = match[1];
            }
        }
    } catch (e) {
        console.error('Could not read .env.local');
    }

    if (!connectionString && process.env.DATABASE_URL) {
        connectionString = process.env.DATABASE_URL;
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Get Table Schema
        const schemaRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bookings';
        `);
        console.log('Bookings Table Schema:', schemaRes.rows);

        // 2. Get Data
        const dataRes = await client.query('SELECT * FROM bookings LIMIT 5');
        console.log('Bookings Data:', dataRes.rows);

        await client.end();
    } catch (error) {
        console.error('Error debugging bookings:', error);
        process.exit(1);
    }
}

debugBookings();
