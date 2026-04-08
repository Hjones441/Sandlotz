import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import ConsultationCTA from '@/components/sections/ConsultationCTA'

export const metadata: Metadata = {
  title: 'About',
  description:
    'R3 LLC is an AI-enabled business systems firm founded by Harrison Jones. Built to eliminate operational drag for companies that need to move faster without adding headcount.',
}

const values = [
  {
    title: 'Systems over heroics',
    description:
      "Sustainable performance comes from well-designed systems, not from working harder. We build the infrastructure so your team doesn't have to rely on individual effort.",
  },
  {
    title: 'Practical over theoretical',
    description:
      "We don't deliver frameworks for you to figure out. We build the actual systems, document them, and make sure your team can use them.",
  },
  {
    title: 'Operator mindset',
    description:
      "We think like founders and operators, not consultants. We care about whether things work — not whether they look good in a slide deck.",
  },
  {
    title: 'AI as leverage, not replacement',
    description:
      "We use AI to do more with less — not to replace judgment. Where AI adds real value in workflows, we integrate it. Where it doesn't, we don't.",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-950 py-24 pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
            About
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6 max-w-3xl leading-tight">
            Built by an operator, for companies that need execution.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            R3 LLC was founded on a simple observation: most business friction isn&apos;t a talent
            problem. It&apos;s a systems design problem.
          </p>
        </div>
      </section>

      {/* Story + Values */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Story */}
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-950 mb-7 leading-tight">
                Why R3 LLC exists.
              </h2>
              <div className="space-y-4 text-zinc-600 leading-relaxed text-[1.0625rem]">
                <p>
                  Most companies don&apos;t struggle because they lack smart people. They struggle
                  because the systems those people work within aren&apos;t designed to support good
                  execution.
                </p>
                <p>
                  Contracts move through email. Obligations fall through the cracks. Approval
                  workflows exist in someone&apos;s memory. Compliance checklists live in a
                  spreadsheet nobody trusts. And every quarter, the same operational problems come
                  back around.
                </p>
                <p>
                  R3 LLC was built to fix that. Not with more headcount. Not with expensive
                  enterprise software. With practical, well-designed business systems — built around
                  how your team actually works.
                </p>
                <p className="font-semibold text-zinc-900">
                  We come in, map the friction, design the system, and build it.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="bg-zinc-50 rounded-2xl p-8">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-7">
                How We Think
              </p>
              <div className="space-y-6">
                {values.map((value) => (
                  <div key={value.title} className="flex gap-4">
                    <CheckCircle2 size={18} className="text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-zinc-900 mb-1">{value.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-zinc-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Photo */}
            <div className="relative max-w-md mx-auto lg:mx-0 w-full">
              <div className="aspect-[4/5] bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-200 rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-zinc-400/30 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Photo coming soon</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-100">
                <p className="font-bold text-zinc-950">Harrison Jones</p>
                <p className="text-zinc-500 text-sm">Founder &amp; Principal, R3 LLC</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">
                Harrison Jones
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-950 mb-6 leading-tight">
                The operator behind R3.
              </h2>
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Harrison spent years working at the intersection of legal operations, business
                  development, and execution — drafting agreements, navigating complex deals, building
                  internal processes, and coordinating across teams for companies that needed to
                  operate better without adding headcount.
                </p>
                <p>
                  He&apos;s been the person in the room who can speak to both the business goal and
                  the operational reality — who can look at a messy intake process and see not just
                  what&apos;s wrong, but what it would take to fix it, and then actually fix it.
                </p>
                <p>
                  R3 LLC is the firm he built to bring that skillset to more companies.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Work With Harrison
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 border border-zinc-300 hover:border-brand-300 text-zinc-700 hover:text-brand-600 font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  View Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConsultationCTA />
    </>
  )
}
