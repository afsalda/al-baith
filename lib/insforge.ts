
import { createClient } from '@insforge/sdk';

// Safely access env vars in both Vite (client) and Node/Vercel (server) environments
// In Vite: import.meta.env.VITE_xxx
// In Node/Vercel: process.env.VITE_xxx or process.env.NEXT_PUBLIC_xxx
const getEnv = (key: string) => {
    // Try import.meta.env first (Vite)
    try {
        if (import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
            return (import.meta as any).env[key];
        }
    } catch (e) { /* ignore */ }

    // Try process.env next (Node/Vercel)
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) { /* ignore */ }

    // Try NEXT_PUBLIC_ variant if VITE_ fails
    try {
        const nextKey = key.replace('VITE_', 'NEXT_PUBLIC_');
        if (typeof process !== 'undefined' && process.env && process.env[nextKey]) {
            return process.env[nextKey];
        }
    } catch (e) { /* ignore */ }

    return undefined;
};

const insforgeUrl = getEnv('VITE_INSFORGE_URL');
const insforgeAnonKey = getEnv('VITE_INSFORGE_ANON_KEY');

if (!insforgeUrl || !insforgeAnonKey) {
    // Log the error to help debug (only on server side to avoid exposing internals to client console too loudly)
    if (typeof process !== 'undefined') {
        console.error('Missing InsForge URL or Anon Key. Checked VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY associated vars.');
    }
    throw new Error('Missing InsForge URL or Anon Key');
}

export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
});
