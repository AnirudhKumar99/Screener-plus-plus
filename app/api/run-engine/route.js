import { NextResponse } from 'next/server';
import { runTradingEngine } from '@/lib/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds execution limit

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'dev-secret-token';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await runTradingEngine();

        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json({ error: result.error || 'Engine failed' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
