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
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'rooms'
        `);
        await client.end();
        return res.status(200).json(result.rows);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
