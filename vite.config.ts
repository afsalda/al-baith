import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Inject env vars into process.env so they are available in ssrLoadModule context
  // This is critical for files expecting process.env.DATABASE_URL etc.
  Object.assign(process.env, env);

  return {
    ssr: {
      external: ['pg'],
    },
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
            if (req.url?.startsWith('/api/')) {
              try {
                // 1. Parse Body
                let body: any = {};
                if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
                  const buffers = [];
                  for await (const chunk of req) {
                    buffers.push(chunk);
                  }
                  const data = Buffer.concat(buffers).toString();
                  if (data) {
                    try {
                      body = JSON.parse(data);
                    } catch (e) {
                      console.warn('Failed to parse body JSON', e);
                    }
                  }
                }

                // 2. Mock Vercel Request/Response
                const vercelReq: any = req;
                vercelReq.body = body;
                vercelReq.query = {};

                // Parse query params manually
                const urlParts = req.url.split('?');
                if (urlParts.length > 1) {
                  const searchParams = new URLSearchParams(urlParts[1]);
                  searchParams.forEach((value, key) => {
                    vercelReq.query[key] = value;
                  });
                }
                // Strip query from URL for file matching
                const pathname = urlParts[0];

                const vercelRes: any = res;
                vercelRes.status = (statusCode: number) => {
                  res.statusCode = statusCode;
                  return vercelRes;
                };
                vercelRes.json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return vercelRes;
                };

                // 3. Match Route to File
                // /api/admin/login -> api/admin/login.ts
                // /api/admin/rooms -> api/admin/rooms/index.ts or api/admin/rooms.ts
                // /api/admin/rooms?id=1 -> api/admin/rooms/[id].ts (if checking ID) OR api/admin/rooms.ts

                let filePath = '';
                const apiPath = pathname.replace('/api/', '');

                // Simple router logic matching the file structure I created
                if (apiPath === 'book-room') filePath = './api/book-room.ts';
                else if (apiPath === 'get-bookings') filePath = './api/get-bookings.ts';
                else if (apiPath === 'admin/login') filePath = './api/admin/login.ts';
                else if (apiPath === 'admin/rooms') filePath = './api/admin/rooms/index.ts';
                else if (apiPath === 'admin/bookings') filePath = './api/admin/bookings/index.ts';
                else if (apiPath === 'admin/settings') filePath = './api/admin/settings.ts';
                else if (pathname.match(/\/api\/admin\/rooms\/\d+/)) {
                  // actually my code uses query param ?id=... but requests to /api/admin/rooms
                  // Wait, my frontend: `/api/admin/rooms?id=${id}` (DELETE/PUT) -> Hits /api/admin/rooms
                  // So it should map to index.ts ??
                  // No, my implementation plan:
                  // `api/admin/rooms/[id].ts` handles UPDATE/DELETE with id query? 
                  // No, usually [id] handles /rooms/123.
                  // If I used query param `?id=...` in `AdminRoomsPage.tsx`, the URL is `/api/admin/rooms?id=1`.
                  // This means it hits `api/admin/rooms/index.ts` logically if I don't handle it.
                  // BUT `api/admin/rooms/[id].ts` is waiting for what? 
                  // Let's re-read the code I wrote for `api/admin/rooms/[id].ts`.
                  // It gets `const { id } = request.query`.
                  // If I request `/api/admin/rooms?id=1`, that goes to `index.ts` normally unless I route it.
                  // However, `index.ts` implementation:
                  // GET (list), POST (create).
                  // It does NOT handle PUT/DELETE.
                  // So I MUST route `/api/admin/rooms` with `?id=` to `[id].ts`?
                  // OR I made a mistake in the frontend to call `/api/admin/rooms?id=x` expecting it to go to `[id].ts`.
                  // Vercel file-based routing:
                  // `/api/admin/rooms` -> `api/admin/rooms/index.ts`
                  // `/api/admin/rooms/123` -> `api/admin/rooms/[id].ts`.

                  // Frontend `AdminRoomsPage.tsx`:
                  // `fetch(\`/api/admin/rooms?id=${id}\`, ...)`
                  // This hits `.../rooms` path. It goes to `index.ts`.
                  // `index.ts` (as I wrote it) ONLY handles GET/POST.
                  // So PUT/DELETE will fail with 405 Method Not Allowed (if I implemented 405) or just run GET logic?
                  // Wait, `index.ts` has `if (GET) ... if (POST) ... return 405`.

                  // Implementation of `[id].ts`:
                  // `export default async function handler...` handles PUT/DELETE.

                  // CORRECTION: The frontend should call `/api/admin/rooms/${id}` NOT `?id=${id}` if I want to hit `[id].ts`.
                  // OR I should merge the logic into `index.ts`.
                  // Merging is easier for this custom router.
                  // But `[id].ts` exists.
                  // Let's fix the frontend to use path params `/api/admin/rooms/${id}`.
                  // AND map it here: `if path matches .../rooms/123 -> .../rooms/[id].ts`.

                  // BUT for now, let's fix the ROUTER in vite logic to try `[id].ts` if exact match implies it.
                  // No, cleaner to fix frontend to match Vercel standard: `/api/user/123`.

                  // Let's support both or just fix frontend.
                  // I will fix Frontend `AdminRoomsPage` and `AdminBookingsPage` to use `/api/admin/rooms/${id}`.
                  // And here I will map `/api/admin/rooms/*` to `[id].ts`.
                }

                // Generic Router Attempt
                if (!filePath) {
                  // Try exact match
                  // e.g. /api/admin/rooms -> ./api/admin/rooms.ts (not exists) OR ./api/admin/rooms/index.ts
                  const potentialFiles = [
                    `./api/${apiPath}.ts`,
                    `./api/${apiPath}/index.ts`,
                    `./api/${apiPath}.js`,
                    `./api/${apiPath}/index.js`
                  ];

                  // If we resolve one, good.
                  // But we can't easily check file existence in async middleware efficiently without fs.
                  // I will trust my mapping for now or use a try/catch loader.

                  // Let's use specific mapping for sure.
                  // Handling the routes I know I created.

                  if (apiPath === 'admin/rooms') filePath = './api/admin/rooms/index.ts';
                  else if (apiPath.startsWith('admin/rooms/')) {
                    filePath = './api/admin/rooms/[id].ts';
                    const id = apiPath.split('/').pop();
                    if (id) vercelReq.query.id = id;
                  }
                  else if (apiPath === 'admin/bookings') filePath = './api/admin/bookings/index.ts';
                  else if (apiPath.startsWith('admin/bookings/')) {
                    filePath = './api/admin/bookings/[id].ts';
                    const id = apiPath.split('/').pop();
                    if (id) vercelReq.query.id = id;
                  }
                  else if (apiPath === 'admin/settings') filePath = './api/admin/settings.ts';
                  // keep existing
                  else if (apiPath === 'book-room') filePath = './api/book-room.ts';
                  else if (apiPath === 'get-bookings') filePath = './api/get-bookings.ts';
                }

                if (filePath) {
                  console.log(`[Vite API] Proxying ${req.method} ${req.url} -> ${filePath}`);
                  const module = await server.ssrLoadModule(filePath);
                  await module.default(vercelReq, vercelRes);
                  return;
                } else {
                  console.warn(`[Vite API] No route found for ${pathname}`);
                }

              } catch (e: any) {
                console.error('[Vite API] Error:', e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
                return;
              }
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
