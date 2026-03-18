import { NextResponse } from 'next/server';
import { runTradingEngine } from '@/lib/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds execution limit

export async function POST(request) {
    try {
        const userId = request.headers.get('x-user-id');
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'dev-secret-token';

        let isValidTrigger = false;
        if (userId) isValidTrigger = true;
        else if (authHeader === `Bearer ${cronSecret}`) isValidTrigger = true;

        if (!isValidTrigger) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { screenerId } = body;

        if (!screenerId) {
            return NextResponse.json({ error: 'Missing screenerId' }, { status: 400 });
        }

        if (userId) {
            const screener = await prisma.screener.findUnique({ where: { id: screenerId } });
            if (!screener || screener.userId !== userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const result = await runTradingEngine(screenerId);

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
