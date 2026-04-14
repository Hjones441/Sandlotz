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

// Auth pages where an authenticated user shouldn't need to land
const AUTH_ROUTES = ['/login', '/signup', '/verify-email']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthed = request.cookies.has('sl-auth')

  // Authenticated user hits the app root or an auth page → go to dashboard
  if (isAuthed && (pathname === '/' || AUTH_ROUTES.some(r => pathname.startsWith(r)))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unauthenticated user tries to access a protected app route → login
  if (!isAuthed && APP_ROUTES.some(r => pathname.startsWith(r))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
