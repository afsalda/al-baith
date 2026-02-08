import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    // Reusing simplified connection logic for this task
    let connectionString = process.env.DATABASE_URL;

    // Load from .env.local if not in env
    if (!connectionString) {
        try {
            const envPath = path.join(__dirname, '..', '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/DATABASE_URL="([^"]+)"/);
                if (match) connectionString = match[1];
            }
        } catch (e) { }
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected.');

        // 1. Add column if not exists
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='bookings' AND column_name='status';
        `);

        if (checkColumn.rows.length === 0) {
            await client.query(`
                ALTER TABLE bookings 
                ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
            `);
            console.log('Added "status" column.');
        } else {
            console.log('"status" column exists.');
        }

        // 2. Backfill nulls
        await client.query(`UPDATE bookings SET status = 'pending' WHERE status IS NULL`);
        console.log('Backfilled null statuses.');

        // 3. Add created_at if missing?
        const checkCreatedAt = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='bookings' AND column_name='created_at';
        `);

        if (checkCreatedAt.rows.length === 0) {
            await client.query(`
                ALTER TABLE bookings 
                ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            `);
            // Backfill created_at
            await client.query(`UPDATE bookings SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
            console.log('Added "created_at" column.');
        } else {
            console.log('"created_at" column exists.');
        }

        console.log('Migration complete.');
        await client.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
