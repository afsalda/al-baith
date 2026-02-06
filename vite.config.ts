import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/book-room' && req.method === 'POST') {
              console.log('[Middleware] POST /api/book-room received');
              const chunks = [];
              req.on('data', chunk => chunks.push(chunk));
              req.on('end', async () => {
                try {
                  const bodyRaw = Buffer.concat(chunks).toString();
                  console.log('[Middleware] Body:', bodyRaw);
                  const body = JSON.parse(bodyRaw);

                  // Dynamic require for CJS compatibility
                  const { createRequire } = await import('module');
                  const require = createRequire(import.meta.url);
                  const { Client } = require('pg');

                  const client = new Client({ connectionString: env.DATABASE_URL, ssl: false });
                  await client.connect();
                  console.log('[Middleware] DB Connected');

                  // 1. Insert customer
                  const insertCustomerQuery = `INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id`;
                  const customerResult = await client.query(insertCustomerQuery, [body.name, body.phone, body.email]);
                  const customerId = customerResult.rows[0].id;

                  // 2. Find room
                  const findRoomQuery = `SELECT id FROM rooms WHERE room_type = $1`;
                  const roomResult = await client.query(findRoomQuery, [body.room_type]);
                  if (roomResult.rows.length === 0) throw new Error(`Room '${body.room_type}' not found`);

                  // 3. Insert booking
                  const insertBookingQuery = `INSERT INTO bookings (customer_id, room_id, check_in, check_out) VALUES ($1, $2, $3, $4)`;
                  await client.query(insertBookingQuery, [customerId, roomResult.rows[0].id, body.check_in, body.check_out]);

                  await client.end();
                  console.log('[Middleware] Booking success');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Booking successful' }));
                } catch (e) {
                  console.error('[Middleware] Error:', e);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
              return;
            }

            if (req.url === '/api/get-bookings' && req.method === 'GET') {
              console.log('[Middleware] GET /api/get-bookings received');
              try {
                const { createRequire } = await import('module');
                const require = createRequire(import.meta.url);
                const { Client } = require('pg');

                const client = new Client({ connectionString: env.DATABASE_URL, ssl: false });
                await client.connect();
                console.log('[Middleware] DB Connected for GET');

                const query = `
                  SELECT 
                    b.id, c.name as "customerName", c.email, c.phone, 
                    b.check_in as "checkIn", b.check_out as "checkOut", 
                    r.room_type as "roomType", r.id as "roomId", r.price
                  FROM bookings b
                  JOIN customers c ON b.customer_id = c.id
                  JOIN rooms r ON b.room_id = r.id
                  ORDER BY b.id DESC
                `;
                const result = await client.query(query);
                const bookings = result.rows.map(row => ({
                  id: row.id.toString(),
                  customerName: row.customerName,
                  email: row.email,
                  phone: row.phone,
                  checkIn: row.checkIn,
                  checkOut: row.checkOut,
                  roomType: row.roomType,
                  roomId: row.roomId ? row.roomId.toString() : 'unknown',
                  guests: 2,
                  totalAmount: row.price ? parseFloat(row.price) : 0,
                  paymentStatus: 'pending',
                  bookingStatus: 'confirmed',
                  createdAt: new Date().toISOString()
                }));
                await client.end();
                console.log(`[Middleware] Fetched ${bookings.length} bookings`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bookings));
              } catch (e) {
                console.error('[Middleware] GET Error:', e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }
            next();
          });
        },
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
