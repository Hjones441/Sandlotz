import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-zinc-950 flex items-center overflow-hidden">
      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
        }}
      />
      {/* Glow accents */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-32 pt-40 w-full">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-400 tracking-wide">
            AI-Enabled Business Systems &amp; Execution
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-[1.04] mb-6 max-w-4xl">
          Fix the friction.
          <br />
          <span className="text-brand-500">Build the system.</span>
          <br />
          Move faster.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mb-10">
          R3 LLC helps companies eliminate contract bottlenecks, operational chaos, and compliance
          drag — with AI-enabled systems designed for practical execution.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-lg transition-all duration-200 text-sm"
          >
            Book a Discovery Call
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white font-medium px-6 py-3.5 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-all duration-200 text-sm"
          >
            See Our Services
            <ChevronRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
        </div>

        {/* Industries served */}
        <div className="mt-20 pt-10 border-t border-zinc-800/60">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-5 font-medium">
            Serving teams in
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              'Sports Organizations',
              'Engineering Firms',
              'SaaS Companies',
              'Consulting Firms',
              'Founder-Led Businesses',
            ].map((industry) => (
              <span key={industry} className="text-sm text-zinc-500">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
