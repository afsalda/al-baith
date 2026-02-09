import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforge } from '../lib/insforge';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const envKeys = Object.keys(process.env);
        const insforgeStatus = insforge ? 'initialized' : 'null';

        let dbCheck = 'not attempted';
        let dbError = null;

        if (insforge) {
            try {
                const { data, error } = await insforge.database.from('rooms').select('id').limit(1);
                if (error) {
                    dbCheck = 'failed';
                    dbError = error;
                } else {
                    dbCheck = 'success';
                }
            } catch (e: any) {
                dbCheck = 'thrown error';
                dbError = e.message;
            }
        }

        return res.status(200).json({
            status: 'ok',
            insforgeStatus,
            dbCheck,
            dbError,
            envKeys: envKeys.filter(k => k.includes('INSFORGE') || k.includes('VITE_')),
            time: new Date().toISOString()
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
