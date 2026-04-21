import { redirect } from 'next/navigation'

// Middleware handles auth-aware routing:
//   authenticated  →  /dashboard
//   unauthenticated → /login
// This fallback catches any edge case the middleware misses.
export default function RootPage() {
  redirect('/login')
}
