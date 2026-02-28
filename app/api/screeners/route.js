import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const screeners = await prisma.screener.findMany({
            where: { userId },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(screeners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch screeners' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { name, url } = await request.json();

        if (!name || !url) {
            return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
        }

        const newScreener = await prisma.screener.create({
            data: { name, url, userId }
        });

        return NextResponse.json(newScreener, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create screener' }, { status: 500 });
    }
}
