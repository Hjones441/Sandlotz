import { redirect } from 'next/navigation'

// The app root is the dashboard.
// Unauthenticated requests are caught by middleware → /login.
// Authenticated requests land here → /dashboard.
export default function RootPage() {
  redirect('/dashboard')
}
