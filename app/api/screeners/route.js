import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const screeners = await prisma.screener.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(screeners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch screeners' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, url } = await request.json();

        if (!name || !url) {
            return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
        }

        const newScreener = await prisma.screener.create({
            data: { name, url }
        });

        return NextResponse.json(newScreener, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create screener' }, { status: 500 });
    }
}
