import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith('/dashboard')
  const isProtectedApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isDashboard || isProtectedApi) {
    // allow cron job
    const authHeader = request.headers.get('authorization')
    if (pathname === '/api/run-engine' && authHeader === `Bearer ${process.env.CRON_SECRET || 'dev-secret-token'}`) {
        return supabaseResponse
    }

    if (!user) {
        if (isProtectedApi) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // if user, inject x-user-id for backwards compatibility
    if (isProtectedApi) {
        supabaseResponse.headers.set('x-user-id', user.id)
    }
  }

  // Redirect away from auth pages if logged in
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
