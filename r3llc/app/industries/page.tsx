import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Wrench, Code2, Building2, User, ArrowRight } from 'lucide-react'
import ConsultationCTA from '@/components/sections/ConsultationCTA'

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'R3 LLC works with sports organizations, engineering firms, SaaS companies, SMBs, and founder-led businesses to eliminate operational drag.',
}

const industries = [
  {
    id: 'sports',
    icon: Trophy,
    name: 'Sports Organizations',
    headline: 'From sponsorship deals to licensing contracts — built for speed.',
    description:
      'Sports organizations deal with a unique set of contractual and operational challenges: short windows to close sponsorship deals, complex licensing arrangements, multi-party agreements, partner onboarding, and compliance requirements that vary by league or governing body.',
    challenges: [
      'Sponsorship contracts moving too slowly through approval',
      'No standard intake process for inbound deal inquiries',
      'Licensing agreements managed in silos across departments',
      'Post-deal obligations tracked manually or not at all',
      'Compliance requirements creating bottlenecks at close',
    ],
    how: "We design the contract and operations infrastructure that lets your team move at the speed of the business — without sacrificing compliance or deal quality.",
    clients: 'Teams, leagues, sports properties, and athlete management firms',
  },
  {
    id: 'engineering',
    icon: Wrench,
    name: 'Engineering & Consulting Firms',
    headline: 'Proposal to post-award — a clean operational track.',
    description:
      'Engineering and consulting firms operate in a high-stakes, compliance-heavy environment. Proposals need to go out fast. SOWs need to be accurate. Subcontractor agreements need to be managed. Post-award obligations need tracking. When any of these break down, it costs time, money, and client trust.',
    challenges: [
      'Proposal management without a clear workflow',
      "SOW creation that's inconsistent across project teams",
      'Subcontractor and vendor agreement bottlenecks',
      'Post-award deliverables falling through the cracks',
      'Project coordination gaps causing delivery delays',
    ],
    how: 'We build the workflow infrastructure that takes your team from proposal to post-award without the chaos — faster turnaround, cleaner documentation, and better visibility.',
    clients: 'Engineering firms, management consulting firms, technical service providers',
  },
  {
    id: 'saas',
    icon: Code2,
    name: 'SaaS Companies',
    headline: 'Contracts that move as fast as your product.',
    description:
      "SaaS companies grow fast — and their contract operations often can't keep up. What worked at 10 customers doesn't work at 100. Vendor agreements pile up. Customer contracts create bottlenecks. NDAs get lost. Procurement is chaotic. The legal review queue becomes a growth bottleneck.",
    challenges: [
      'Customer agreements sitting in legal review for weeks',
      'No standard NDA or vendor agreement intake process',
      'Procurement approvals creating cross-functional friction',
      'Contract renewal tracking done in spreadsheets',
      'No visibility into which agreements are active, expired, or in renewal',
    ],
    how: 'We build the contract ops infrastructure that scales with your growth — from intake through execution, with AI-enabled review and full workflow visibility.',
    clients: 'Seed-stage through Series B SaaS, product-led growth companies, B2B software businesses',
  },
  {
    id: 'smb',
    icon: Building2,
    name: 'SMBs with Operational Bottlenecks',
    headline: "You've outgrown informal. Time to build the system.",
    description:
      "Small and mid-sized businesses often grow past their processes before they realize it. What started as informal coordination — handled by the right people using good judgment — breaks down as the team scales. The same operational problems come back every quarter.",
    challenges: [
      "Processes that exist in people's heads, not in documentation",
      'Operational coordination burning leadership time',
      'No clear intake or approval process for agreements',
      "Compliance requirements that nobody fully owns",
      'Manual work that should be systematized',
    ],
    how: "We map what's broken, design the fix, and implement it. Practical systems built for how your team actually works — not textbook process redesign.",
    clients: 'Companies with 10–200 employees in professional services and operations-heavy industries',
  },
  {
    id: 'founders',
    icon: User,
    name: 'Founder-Led Businesses',
    headline: 'An operator in your corner.',
    description:
      "Founders are often the best salesperson, the best product thinker, and the most important relationship manager in the company. They shouldn't also be the contract reviewer, the process designer, and the operations coordinator. That's where R3 comes in.",
    challenges: [
      'Founder bottlenecking approvals because there is no process',
      "Deals getting stuck because there's no clear owner",
      'Operations running on tribal knowledge and founder memory',
      'Scaling past the point where informal processes work',
      'No time to build the systems the business needs',
    ],
    how: "We become the operator you need — embedded, practical, and focused on the stuff that actually slows you down. We build the systems so you don't have to.",
    clients: 'Founder-led businesses from pre-revenue to $10M+ ARR, CEO-driven companies without a COO',
  },
]

export default function IndustriesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-950 py-24 pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
            Industries
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6 max-w-3xl leading-tight">
            We work where operational friction is most expensive.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            Five industries. One consistent problem. We help companies in each sector eliminate the
            process debt and workflow friction that slows them down.
          </p>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {industries.map((industry, index) => {
            const Icon = industry.icon
            return (
              <div
                key={industry.id}
                id={industry.id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start scroll-mt-24"
              >
                {/* Text — alternates sides */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 mb-6">
                    <Icon size={15} className="text-zinc-600" />
                    <span className="text-xs font-semibold text-zinc-600">{industry.name}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-950 mb-2 leading-tight">
                    {industry.name}
                  </h2>
                  <p className="text-brand-600 font-semibold mb-5">{industry.headline}</p>
                  <p className="text-zinc-600 leading-relaxed mb-6">{industry.description}</p>

                  <div className="bg-zinc-50 rounded-xl p-5 mb-6">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                      Common Challenges
                    </p>
                    <ul className="space-y-2">
                      {industry.challenges.map((challenge) => (
                        <li key={challenge} className="flex items-start gap-2.5 text-sm text-zinc-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-500">Typical clients: </span>
                    {industry.clients}
                  </p>
                </div>

                {/* How we help */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="bg-zinc-950 rounded-2xl p-8">
                    <p className="text-brand-500 text-xs font-semibold uppercase tracking-widest mb-4">
                      How We Help
                    </p>
                    <p className="text-zinc-300 leading-relaxed mb-8">{industry.how}</p>
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-3 rounded-lg transition-colors w-full text-sm"
                    >
                      Talk about your industry
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </Link>
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
