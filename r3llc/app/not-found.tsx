import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
          404
        </p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
          Page not found.
        </h1>
        <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
          That page doesn&apos;t exist. Might be worth double-checking the URL.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
      </div>
    </div>
  )
}
