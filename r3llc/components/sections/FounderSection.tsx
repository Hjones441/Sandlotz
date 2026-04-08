import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function FounderSection() {
  return (
    <section className="bg-zinc-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Photo placeholder */}
          <div className="relative max-w-md mx-auto lg:mx-0 w-full">
            <div className="aspect-[4/5] bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-200 rounded-2xl overflow-hidden">
              {/* Replace with <Image> when you have a headshot */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-400/40 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">Photo coming soon</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-100">
              <p className="font-bold text-zinc-950">Harrison Jones</p>
              <p className="text-zinc-500 text-sm">Founder &amp; Principal, R3 LLC</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">
              The Founder
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-6 leading-tight">
              Built by someone who&apos;s lived on both sides of the friction.
            </h2>
            <div className="space-y-4 text-zinc-600 leading-relaxed text-[1.0625rem]">
              <p>
                Harrison spent years at the intersection of legal operations, business
                development, and execution — navigating complex deals, building workflows, and
                coordinating across teams for companies that needed to operate better without
                growing their headcount.
              </p>
              <p>
                He built R3 LLC because most companies don&apos;t have a talent problem. They
                have a systems design problem. Contracts move through email. Obligations fall
                through the cracks. Good people spend time firefighting instead of building.
              </p>
              <p className="font-semibold text-zinc-800">
                R3 LLC exists to fix that — with practical systems, AI-enabled workflows, and an
                operator&apos;s mindset.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-brand-600 font-semibold hover:gap-3 transition-all duration-200 text-sm"
              >
                More about R3
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Work With Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
