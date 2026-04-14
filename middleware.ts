import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const APP_ROUTES = [
  '/dashboard',
  '/leaderboard',
  '/profile',
  '/marketplace',
  '/perks',
  '/log-activity',
]

// Routes where an already-authenticated user should be sent to the app instead
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/verify-email']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthed = request.cookies.has('sl-auth')

  // Already-authenticated user visits the marketing homepage → send to app
  if (isAuthed && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Already-authenticated user visits auth pages (login/signup) → send to app
  if (isAuthed && AUTH_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unauthenticated user tries to access app routes → send to login
  if (!isAuthed && APP_ROUTES.some(r => pathname.startsWith(r))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next.js internals, static files, and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
