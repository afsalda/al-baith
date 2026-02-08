import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    // Read .env.local manually to get the connection string
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

    if (!connectionString) {
        console.error('Error: DATABASE_URL not found in .env.local');
        // In some environments, it might be in process.env directly if not using .env.local file
        if (process.env.DATABASE_URL) {
            connectionString = process.env.DATABASE_URL;
        } else {
            process.exit(1);
        }
    }

    console.log('Using connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));

    const client = new Client({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database for migration.');

        // 1. Create Admins Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Verified/Created "admins" table.');

        // 2. Create Settings Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(50) NOT NULL UNIQUE,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Verified/Created "settings" table.');

        // 3. Update Rooms Table (Add image_url)
        // Check if column exists first to avoid error
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='rooms' AND column_name='image_url';
        `);

        if (checkColumn.rows.length === 0) {
            await client.query(`
                ALTER TABLE rooms 
                ADD COLUMN image_url TEXT;
            `);
            console.log('Added "image_url" column to "rooms" table.');
        } else {
            console.log('"image_url" column already exists in "rooms".');
        }

        // 4. Seed Default Admin
        const defaultEmail = 'admin@al-baith.com';
        const defaultPassword = 'admin';

        const checkAdmin = await client.query('SELECT * FROM admins WHERE email = $1', [defaultEmail]);
        if (checkAdmin.rows.length === 0) {
            await client.query(`
                INSERT INTO admins (name, email, password_hash)
                VALUES ($1, $2, $3)
            `, ['Admin User', defaultEmail, defaultPassword]);
            console.log(`Seeded default admin: ${defaultEmail}`);
        } else {
            console.log('Default admin already exists.');
        }

        // 5. Seed Default Settings
        const defaultSettings = [
            { key: 'hotel_name', value: 'Al-Baith Resthouse' },
            { key: 'address', value: 'Kochi, Kerala, India' },
            { key: 'phone', value: '+91 9447290936' },
            { key: 'map_url', value: 'https://www.google.com/maps/embed/...' }
        ];

        for (const setting of defaultSettings) {
            const checkSetting = await client.query('SELECT * FROM settings WHERE key = $1', [setting.key]);
            if (checkSetting.rows.length === 0) {
                await client.query('INSERT INTO settings (key, value) VALUES ($1, $2)', [setting.key, setting.value]);
                console.log(`Seeded setting: ${setting.key}`);
            }
        }

        console.log('Migration completed successfully!');
        await client.end();

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
