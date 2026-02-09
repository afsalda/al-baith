import { createClient } from '@insforge/sdk';

// Hardcoded credentials for production - bypasses Vercel env var issues
const INSFORGE_URL = 'https://i8m3i9mq.us-west.insforge.app';
const INSFORGE_KEY = 'ik_193e152f1386d1beed3ac3af245345b01773d53da044715f726c94493c64ada3';

export const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_KEY,
});

// Helper for backward compatibility
export const getInsforgeClient = () => insforge;
