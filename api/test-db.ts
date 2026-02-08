import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
const { Client } = pg;

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    const connectionString = "postgresql://neondb_owner:npg_1jGmLdRfwl8X@ep-flat-shape-aib20yxl-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require";
    const client = new Client({ connectionString });

    try {
        await client.connect();

        // Check for common utilities
        const hasUUID = await client.query('SELECT gen_random_uuid()').then(() => true).catch(() => false);
        const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);

        await client.end();
        return res.status(200).json({
            success: true,
            hasUUID,
            tables: tables.rows.map(r => r.table_name)
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
