import type { Metadata } from 'next'
import { Search, Wrench, Rocket, CheckCircle2 } from 'lucide-react'
import ConsultationCTA from '@/components/sections/ConsultationCTA'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Our 3-phase process: discover, design, and build. No endless discovery. No bloated project plans. Most clients see measurable improvement within 30 days.',
}

const phases = [
  {
    number: '01',
    Icon: Search,
    name: 'Discovery & Audit',
    duration: 'Weeks 1–2',
    description:
      "Before we propose anything, we understand your current state completely. We'll map your workflows, interview your team, review your tools and documentation, and build a clear picture of where friction lives and what it's costing you.",
    activities: [
      'Stakeholder interviews (1–3 people)',
      'Current workflow documentation and mapping',
      'Tool and system inventory',
      'Bottleneck and friction identification',
      'Root cause analysis',
    ],
    deliverables: [
      'Current-state workflow map (visual)',
      'Friction and gap inventory',
      'Priority fix list with effort/impact scores',
      'Recommended engagement scope and timeline',
    ],
  },
  {
    number: '02',
    Icon: Wrench,
    name: 'Design & Build',
    duration: 'Weeks 3–8 (varies by scope)',
    description:
      "We design the solution and build it. This could be a contract ops workflow, an AI-enabled intake system, a compliance tracking framework, or a broader operational redesign. We build it with your team — training, validating, and iterating as we go.",
    activities: [
      'System architecture and workflow design',
      'Tool configuration and integration',
      'AI workflow implementation (where applicable)',
      'SOP and process documentation drafting',
      'Team review and iteration sessions',
    ],
    deliverables: [
      'Live operational system or workflow',
      'SOPs and full process documentation',
      'Team training materials',
      'Handoff plan or continued engagement scope',
    ],
  },
  {
    number: '03',
    Icon: Rocket,
    name: 'Launch & Optimize',
    duration: 'Ongoing (or defined close)',
    description:
      "We launch the system, train the team, and stay involved for questions and adjustments. Most clients see measurable operational improvement within 30 days. Retainer clients get a monthly review and roadmap update built into the engagement.",
    activities: [
      'Live system launch',
      'Team training session',
      'Post-launch support window',
      'Performance monitoring',
      'Iteration based on real usage data',
    ],
    deliverables: [
      'Operational system in production',
      'Team capability to maintain and use the system',
      'Monthly operating rhythm (retainer clients)',
      'Improvement metrics and reporting dashboard',
    ],
  },
]

const faqs = [
  {
    q: 'How long does a typical engagement take?',
    a: 'A Workflow Clarity Audit takes 2 weeks. A Contract Ops Buildout takes 6–8 weeks. Retainer engagements are ongoing by definition. We move as fast as the client needs to.',
  },
  {
    q: 'What do I need to provide?',
    a: "Access to 1–3 people on your team, your current documentation (even if it's just emails), and a willingness to be honest about what's broken. We'll take it from there.",
  },
  {
    q: 'Do you work with specific tools?',
    a: "We work with your existing stack where possible. We'll recommend improvements if the tools are creating friction, but we don't require you to buy anything specific.",
  },
  {
    q: "What if I don't know which service I need?",
    a: "That's exactly what a discovery call is for. We'll ask a few questions, get a sense of your situation, and recommend the right starting point — even if that's just the Audit.",
  },
  {
    q: 'Do you work remotely?',
    a: 'Yes. We work with clients across the country. All engagement work is conducted remotely. On-site workshops are available for local clients on request.',
  },
  {
    q: 'Can we start small and expand?',
    a: 'Absolutely. Many clients start with a Workflow Clarity Audit and expand from there once they have a clear picture of the problem. That is by design.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-950 py-24 pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
            How It Works
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6 max-w-3xl leading-tight">
            A process designed for results, not process.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            No endless discovery phases. No 50-slide proposals. We understand your situation,
            design the fix, build it, and hand it off. Most clients see measurable improvement in
            30 days.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {phases.map((phase) => {
            const { Icon } = phase
            return (
              <div key={phase.number} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                  <div className="flex items-center gap-5 mb-7">
                    <span className="text-7xl font-black text-zinc-100 leading-none select-none">
                      {phase.number}
                    </span>
                    <div>
                      <p className="text-xs text-zinc-400 font-medium mb-0.5">{phase.duration}</p>
                      <h2 className="text-2xl font-black tracking-tighter text-zinc-950">
                        {phase.name}
                      </h2>
                    </div>
                  </div>
                  <p className="text-zinc-600 leading-relaxed mb-7">{phase.description}</p>

                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                      What we do
                    </p>
                    <ul className="space-y-2.5">
                      {phase.activities.map((activity) => (
                        <li key={activity} className="flex items-start gap-2.5 text-sm text-zinc-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-8">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">
                    Deliverables
                  </p>
                  <ul className="space-y-4">
                    {phase.deliverables.map((deliverable) => (
                      <li key={deliverable} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-700 text-sm leading-relaxed">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black tracking-tighter text-zinc-950 mb-12">
            Common questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-zinc-200 pb-8">
                <h3 className="font-bold text-zinc-900 mb-3">{faq.q}</h3>
                <p className="text-zinc-600 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConsultationCTA />
    </>
  )
}
