import Link from 'next/link'
import { Trophy, Wrench, Code2, Building2, User } from 'lucide-react'

const industries = [
  {
    icon: Trophy,
    name: 'Sports Organizations',
    description:
      'Sponsorship agreements, licensing contracts, partner onboarding, and compliance workflows for teams, leagues, and properties.',
    href: '/industries#sports',
  },
  {
    icon: Wrench,
    name: 'Engineering & Consulting Firms',
    description:
      'Proposal management, SOW workflows, subcontractor agreements, post-award compliance, and project coordination systems.',
    href: '/industries#engineering',
  },
  {
    icon: Code2,
    name: 'SaaS Companies',
    description:
      'Vendor contracts, customer agreements, NDAs, procurement workflows, and the internal systems to manage them at scale.',
    href: '/industries#saas',
  },
  {
    icon: Building2,
    name: 'SMBs with Operational Bottlenecks',
    description:
      "You've grown past informal processes but haven't built the infrastructure to match. That's exactly where we operate.",
    href: '/industries#smb',
  },
  {
    icon: User,
    name: 'Founder-Led Businesses',
    description:
      "You need an operator in your corner — someone who can look at your full business and identify what's slowing you down.",
    href: '/industries#founders',
  },
]

export default function IndustriesSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Who We Work With
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-4 leading-tight">
            Industries we know well.
          </h2>
          <p className="text-zinc-500 text-lg leading-relaxed">
            We focus where operational drag is most expensive. These are the sectors where contract
            friction, workflow gaps, and process debt cost the most.
          </p>
        </div>

        {/* Industry cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((industry, index) => {
            const Icon = industry.icon
            return (
              <Link
                key={industry.name}
                href={industry.href}
                className={`group bg-zinc-50 hover:bg-white border border-zinc-200 hover:border-brand-200 hover:shadow-md rounded-xl p-6 transition-all duration-200 ${
                  index === 4 ? 'lg:col-start-2' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center mb-5 group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors duration-200">
                  <Icon
                    size={20}
                    className="text-zinc-400 group-hover:text-brand-600 transition-colors duration-200"
                  />
                </div>
                <h3 className="text-zinc-950 font-bold text-base mb-2 group-hover:text-brand-700 transition-colors">
                  {industry.name}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{industry.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
