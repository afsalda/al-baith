
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

// Initialize with checks inside a proxy or just check before use in handlers
// To prevent top-level module load failures, we export a possibly null/invalid client 
// and handle it in the handlers.
export const insforge = (insforgeUrl && insforgeAnonKey)
    ? createClient({
        baseUrl: insforgeUrl,
        anonKey: insforgeAnonKey,
    })
    : null as any;

if (!insforge && typeof process !== 'undefined') {
    console.warn('InsForge client NOT initialized due to missing VITE_INSFORGE_URL or VITE_INSFORGE_ANON_KEY');
}
