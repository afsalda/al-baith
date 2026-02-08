import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkAdmin() {
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
        if (process.env.DATABASE_URL) {
            connectionString = process.env.DATABASE_URL;
        } else {
            console.error('Error: DATABASE_URL not found');
            process.exit(1);
        }
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const result = await client.query('SELECT * FROM admins');
        console.log('Admins found:', result.rows);

        await client.end();
    } catch (error) {
        console.error('Error checking admin:', error);
        process.exit(1);
    }
}

checkAdmin();
