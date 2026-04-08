import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

export default function ConsultationCTA() {
  return (
    <section className="bg-brand-700 py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-5">
          Ready to Start
        </p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-5 leading-tight">
          Stop managing friction.
          <br />
          Start building systems.
        </h2>
        <p className="text-brand-200 text-lg leading-relaxed max-w-xl mx-auto mb-10">
          A 30-minute discovery call is all it takes to identify where your biggest bottlenecks
          are — and whether R3 is the right fit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 bg-white hover:bg-zinc-50 text-brand-700 font-bold px-8 py-4 rounded-lg transition-all duration-200 text-sm"
          >
            <Calendar size={17} />
            Book a Free Discovery Call
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
          <Link
            href="/services"
            className="text-brand-200 hover:text-white font-medium transition-colors text-sm"
          >
            Browse services first →
          </Link>
        </div>
      </div>
    </section>
  )
}
