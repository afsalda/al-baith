import http from 'http';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Get a booking ID to test with
async function getBookingId() {
    const connectionString = 'postgres://postgres:qwer321@@localhost:5432/hotel_db';
    const client = new Client({ connectionString, ssl: false });
    await client.connect();
    const res = await client.query('SELECT id FROM bookings LIMIT 1');
    await client.end();
    return res.rows[0]?.id;
}

// 2. Login to get token
function login() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/api/admin/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).token));
        });
        req.write(JSON.stringify({ email: 'admin@al-baith.com', password: 'admin' }));
        req.end();
    });
}

// 3. Test Update
async function test() {
    try {
        const id = await getBookingId();
        if (!id) {
            console.log('No bookings found.');
            return;
        }
        console.log(`Testing update for booking ID: ${id}`);

        const token = await login();
        console.log('Got token.');

        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: `/api/admin/bookings/${id}`,
            method: 'PUT', // Change to PUT
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => console.log(`BODY: ${chunk}`));
        });

        req.write(JSON.stringify({ status: 'confirmed' }));
        req.end();

    } catch (e) {
        console.error(e);
    }
}

test();
