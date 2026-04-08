import Link from 'next/link'
import { ArrowRight, Search, Workflow, BrainCircuit, Shield, Users } from 'lucide-react'

const services = [
  {
    id: 'workflow-audit',
    icon: Search,
    name: 'Workflow Clarity Audit',
    tagline: 'Understand exactly where your process breaks down.',
    description:
      'We map your current workflow, identify friction points, and deliver a prioritized action plan with SOPs and a workflow diagram.',
    timeline: '2 weeks',
    investment: 'From $3,500',
    href: '/services#workflow-audit',
  },
  {
    id: 'contract-ops',
    icon: Workflow,
    name: 'Contract Ops Buildout',
    tagline: 'Replace ad-hoc with a system that actually scales.',
    description:
      'End-to-end contract operations design and implementation — intake, routing, review, redline, approval, and execution. AI-enabled where it matters.',
    timeline: '6–8 weeks',
    investment: 'From $9,500',
    href: '/services#contract-ops',
  },
  {
    id: 'advisory',
    icon: BrainCircuit,
    name: 'Business Systems Advisory',
    tagline: 'Operational architecture for companies that need to move faster.',
    description:
      'Fractional execution partner for leadership teams dealing with process gaps, operational debt, and coordination breakdowns.',
    timeline: 'Monthly retainer',
    investment: 'From $5,500/mo',
    href: '/services#advisory',
  },
  {
    id: 'compliance',
    icon: Shield,
    name: 'Post-Award Compliance Layer',
    tagline: 'Track obligations. Manage risk. Stay current.',
    description:
      'Systems and workflows to manage post-award deliverables, compliance milestones, and obligation tracking — so nothing falls through the cracks.',
    timeline: '4–6 weeks',
    investment: 'From $4,500',
    href: '/services#compliance',
  },
  {
    id: 'fractional',
    icon: Users,
    name: 'Fractional Ops Partner',
    tagline: 'An operator in your corner without the full-time cost.',
    description:
      'Ongoing embedded support for execution, coordination, and systems maintenance. Built for founder-led teams and lean ops departments.',
    timeline: 'Monthly retainer',
    investment: 'From $4,000/mo',
    href: '/services#fractional',
  },
]

export default function ServicesOverview() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-4 leading-tight">
            Five ways we reduce drag and build leverage.
          </h2>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Every engagement starts with understanding your current state. Then we design and
            implement the systems that get you unstuck.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Link
                key={service.id}
                href={service.href}
                className={`group bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-lg hover:border-brand-300 transition-all duration-200 flex flex-col ${
                  index === 4 ? 'lg:col-start-2' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-5">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <h3 className="text-zinc-950 font-bold text-base mb-1.5 group-hover:text-brand-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-brand-600 text-xs font-semibold mb-3">{service.tagline}</p>
                <p className="text-zinc-500 text-sm leading-relaxed flex-1 mb-5">
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">{service.timeline}</p>
                    <p className="text-sm font-semibold text-zinc-800">{service.investment}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-zinc-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all duration-200"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
