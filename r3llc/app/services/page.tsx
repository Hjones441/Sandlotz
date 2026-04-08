import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, Workflow, BrainCircuit, Shield, Users, CheckCircle2, ArrowRight } from 'lucide-react'
import ConsultationCTA from '@/components/sections/ConsultationCTA'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Five AI-enabled service offers: Workflow Clarity Audit, Contract Ops Buildout, Business Systems Advisory, Post-Award Compliance Layer, and Fractional Ops Partner.',
}

const services = [
  {
    id: 'workflow-audit',
    icon: Search,
    name: 'Workflow Clarity Audit',
    tagline: 'Understand exactly where your process breaks down.',
    description:
      "Before you can fix it, you need to see it clearly. The Workflow Clarity Audit is a focused 2-week engagement where we map your current contract or operations workflow end-to-end, interview the people doing the work, and identify exactly where friction, delays, and errors are entering the system.",
    includes: [
      'Current-state workflow map (visual)',
      'Friction and bottleneck inventory',
      'Root cause analysis',
      'Prioritized fix list with effort/impact scores',
      'Standard Operating Procedure (SOP) draft for the primary workflow',
      '1-hour readout and strategy session',
    ],
    forWho:
      "Companies that suspect their workflow is broken but don't have a clear picture of where or why. Also the ideal starting point for any larger engagement.",
    timeline: '2 weeks',
    investment: 'From $3,500',
    accent: 'bg-blue-50 border-blue-200',
    accentIcon: 'text-blue-600',
  },
  {
    id: 'contract-ops',
    icon: Workflow,
    name: 'Contract Ops Buildout',
    tagline: 'Replace ad-hoc with a system that actually scales.',
    description:
      "This is our most comprehensive offer. We design and implement your end-to-end contract operations — from intake and routing to review, redline, approval, and execution. We'll integrate AI-enabled first-pass review where it makes sense, set up your dashboards, and build the guardrails that keep things on track without requiring manual oversight of every step.",
    includes: [
      'Full intake form architecture and routing logic',
      'Contract routing and assignment workflow',
      'Review and redline process design',
      'AI-assisted first-pass review integration',
      'Approval and execution workflow',
      'Dashboard and visibility setup',
      'SOPs and team training materials',
      '30-day post-launch support window',
    ],
    forWho:
      "Companies processing 10+ contracts per month who currently have no formal intake system, or whose system is held together by email and spreadsheets.",
    timeline: '6–8 weeks',
    investment: 'From $9,500',
    accent: 'bg-indigo-50 border-indigo-200',
    accentIcon: 'text-indigo-600',
  },
  {
    id: 'advisory',
    icon: BrainCircuit,
    name: 'Business Systems Advisory',
    tagline: 'Operational architecture for companies that need to move faster.',
    description:
      "Sometimes the problem isn't just contracts. It's the whole operating rhythm — coordination failures, process debt, unclear ownership, and execution gaps that compound over time. Business Systems Advisory is a fractional engagement where we work alongside your leadership team to identify, prioritize, and fix the operational issues that are costing you the most.",
    includes: [
      'Monthly operational review and prioritization session',
      'Process redesign for highest-priority bottlenecks',
      'Coordination and handoff workflow improvements',
      'AI-enabled process leverage identification',
      'Compliance and regulatory workflow support',
      'Executive operating structure recommendations',
      'Async availability for questions and escalations',
      'Monthly report and updated operational roadmap',
    ],
    forWho:
      "Leadership teams dealing with operational debt, coordination failures, or growth that has outpaced their processes. Best for companies that need an operator, not another consultant.",
    timeline: 'Monthly retainer',
    investment: 'From $5,500/month',
    accent: 'bg-violet-50 border-violet-200',
    accentIcon: 'text-violet-600',
  },
  {
    id: 'compliance',
    icon: Shield,
    name: 'Post-Award Compliance Layer',
    tagline: 'Track obligations. Manage risk. Stay current.',
    description:
      "Winning a contract is one thing. Managing the obligations that follow is another. The Post-Award Compliance Layer is a 4–6 week engagement where we design and implement the systems you need to track deliverables, monitor compliance milestones, flag risks, and maintain visibility across your active agreements.",
    includes: [
      'Post-award obligation inventory and mapping',
      'Compliance milestone tracking system setup',
      'Deliverable management workflow',
      'Risk flag and escalation process design',
      'Dashboard for active contract visibility',
      'Team notification and automated reminder system',
      'SOPs for ongoing compliance management',
    ],
    forWho:
      "Companies with government contracts, complex licensing agreements, or multi-party deals where missed obligations have real financial or legal consequences.",
    timeline: '4–6 weeks',
    investment: 'From $4,500',
    accent: 'bg-emerald-50 border-emerald-200',
    accentIcon: 'text-emerald-600',
  },
  {
    id: 'fractional',
    icon: Users,
    name: 'Fractional Ops Partner',
    tagline: "An operator in your corner without the full-time cost.",
    description:
      "This is for companies that need ongoing execution support but don't need a full-time hire. As your Fractional Ops Partner, we stay embedded in your business — available for deal support, process questions, contract review escalations, and whatever operational challenges come up week to week.",
    includes: [
      'Defined weekly hours of availability',
      'Deal flow and contract support',
      'Escalation handling and fast-turn reviews',
      'Ongoing process improvement and refinement',
      'New workflow design as business needs evolve',
      'Team coordination support',
      'Monthly ops check-in and roadmap update',
    ],
    forWho:
      "Founder-led businesses and lean teams that need an experienced operator available on a consistent basis — but not on payroll.",
    timeline: 'Monthly retainer',
    investment: 'From $4,000/month',
    accent: 'bg-amber-50 border-amber-200',
    accentIcon: 'text-amber-600',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-950 py-24 pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
            Services
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6 max-w-3xl leading-tight">
            Five ways we eliminate friction and build operational leverage.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            Every engagement is designed to deliver measurable improvement — faster contract
            turnaround, cleaner processes, and systems your team can actually use.
          </p>
        </div>
      </section>

      {/* Services detail */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-28">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.id}
                id={service.id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start scroll-mt-24"
              >
                {/* Left: description */}
                <div>
                  <div
                    className={`inline-flex items-center gap-2 border rounded-lg px-3 py-1.5 mb-6 ${service.accent}`}
                  >
                    <Icon size={15} className={service.accentIcon} />
                    <span className={`text-xs font-semibold ${service.accentIcon}`}>
                      {service.name}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-950 mb-2 leading-tight">
                    {service.name}
                  </h2>
                  <p className="text-brand-600 font-semibold mb-5">{service.tagline}</p>
                  <p className="text-zinc-600 leading-relaxed mb-7">{service.description}</p>

                  <div className="bg-zinc-50 rounded-xl p-5 mb-7">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                      Best for
                    </p>
                    <p className="text-zinc-700 text-sm leading-relaxed">{service.forWho}</p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-xs text-zinc-400 mb-0.5">Timeline</p>
                      <p className="font-semibold text-zinc-800">{service.timeline}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-200" />
                    <div>
                      <p className="text-xs text-zinc-400 mb-0.5">Investment</p>
                      <p className="font-bold text-zinc-950">{service.investment}</p>
                    </div>
                  </div>
                </div>

                {/* Right: deliverables + CTA */}
                <div>
                  <div className="bg-zinc-950 rounded-2xl p-8">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-6">
                      What&apos;s Included
                    </p>
                    <ul className="space-y-3.5">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle2
                            size={16}
                            className="text-brand-500 mt-0.5 flex-shrink-0"
                          />
                          <span className="text-zinc-300 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 pt-6 border-t border-zinc-800">
                      <Link
                        href="/contact"
                        className="group w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3.5 rounded-lg transition-colors"
                      >
                        Start a Conversation
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <ConsultationCTA />
    </>
  )
}
