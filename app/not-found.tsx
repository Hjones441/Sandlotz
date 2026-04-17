import Link from 'next/link'

export const metadata = { title: '404 — Page Not Found · Sandlotz' }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0825] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🏃</div>
        <h1 className="text-5xl font-black text-brand-yellow mb-3">404</h1>
        <p className="text-white text-xl font-bold mb-2">Out of bounds</p>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          This page doesn&apos;t exist — but your next PR does.
          Get back to earning PlayerPoints.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary text-center">
            Back to Dashboard
          </Link>
          <Link href="/log-activity" className="btn-ghost text-center">
            Log a Workout
          </Link>
        </div>
      </div>
    </div>
  )
}
