
import { createClient } from '@insforge/sdk';

// Robust environment variable loader
const getEnv = (key: string): string | undefined => {
    // 1. Try process.env (Node.js / Vercel Serverless)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }

    // 2. Try import.meta.env (Vite Client-side)
    try {
        const meta = (import.meta as any);
        if (meta && meta.env && meta.env[key]) {
            return meta.env[key];
        }
    } catch (e) { }

    // 3. Fallback for NEXT_PUBLIC_ pattern if needed
    const nextKey = key.startsWith('VITE_') ? key.replace('VITE_', 'NEXT_PUBLIC_') : `NEXT_PUBLIC_${key}`;
    if (typeof process !== 'undefined' && process.env && process.env[nextKey]) {
        return process.env[nextKey];
    }

    return undefined;
};

// Singleton pattern with lazy initialization to prevent top-level crashes
let _client: any = null;

export const getInsforgeClient = () => {
    if (_client) return _client;

    const url = getEnv('VITE_INSFORGE_URL');
    const key = getEnv('VITE_INSFORGE_ANON_KEY');

    if (!url || !key) {
        console.warn('InsForge credentials missing in getInsforgeClient');
        return null;
    }

    try {
        _client = createClient({
            baseUrl: url,
            anonKey: key,
        });
        return _client;
    } catch (error) {
        console.error('Failed to create InsForge client:', error);
        return null;
    }
};

// For backward compatibility but safe
export const insforge = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getInsforgeClient();
        if (!client) throw new Error(`InsForge client not initialized. Missing VITE_INSFORGE_URL or VITE_INSFORGE_ANON_KEY. Checked process.env.${prop.toString()}`);
        return client[prop];
    }
});
