import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request) {
    return await updateSession(request);
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/register'],
};
