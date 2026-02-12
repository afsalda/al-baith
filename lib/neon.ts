import { neon } from '@neondatabase/serverless';

// Remove channel_binding=require as the Neon HTTP driver doesn't support it
const DATABASE_URL = process.env.DATABASE_URL?.replace('&channel_binding=require', '') ||
    'postgresql://neondb_owner:npg_1jGmLdRfwl8X@ep-flat-shape-aib20yxl-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(DATABASE_URL);
