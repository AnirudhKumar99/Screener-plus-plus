import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect /dashboard and API endpoints (except auth and cron triggers)
    const isDashboard = pathname.startsWith('/dashboard');
    const isProtectedApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');

    if (isDashboard || isProtectedApi) {
        const authHeader = request.headers.get('authorization');
        if (pathname === '/api/run-engine' && authHeader === `Bearer ${process.env.CRON_SECRET || 'dev-secret-token'}`) {
            return NextResponse.next();
        }

        const token = request.cookies.get('authToken')?.value;

        if (!token) {
            if (isProtectedApi) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const payload = await verifyToken(token);
        if (!payload) {
            if (isProtectedApi) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Inject user context into request headers for API routes
        if (isProtectedApi) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', payload.userId);
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }
    }

    // Redirect logged-in users away from auth pages directly into /dashboard
    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (isAuthPage) {
        const token = request.cookies.get('authToken')?.value;
        if (token) {
            const payload = await verifyToken(token);
            if (payload) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/register'],
};
