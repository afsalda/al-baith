import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_1jGmLdRfwl8X@ep-flat-shape-aib20yxl-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(DATABASE_URL);
