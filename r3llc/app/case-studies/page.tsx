import type { Metadata } from 'next'
import Link from 'next/link'
import ConsultationCTA from '@/components/sections/ConsultationCTA'

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'See how R3 LLC has helped companies eliminate operational drag, accelerate contract workflows, and build execution infrastructure that scales.',
}

const studies = [
  {
    id: 'engineering-contract-ops',
    tag: 'Contract Ops Buildout',
    industry: 'Engineering Firm',
    challenge:
      'A 75-person engineering firm was processing 30+ contracts per month through email, with no formal intake system and no visibility into where agreements were in the review process. Average contract cycle time was 22 business days. Leadership was spending 4–6 hours per week manually routing and following up on contracts.',
    approach:
      'We conducted a 2-week Workflow Clarity Audit, then designed and implemented a full contract ops system — structured intake form, automated routing logic, review workflow with AI-assisted first-pass, and a real-time approval dashboard.',
    result:
      'Contract cycle time dropped to 9 business days within 60 days of launch. Leadership reclaimed 5+ hours per week. The team went from reactive to proactive on deal management.',
    metrics: [
      { label: 'Cycle time reduction', value: '59%' },
      { label: 'Manual routing steps eliminated', value: '12' },
      { label: 'Days to measurable improvement', value: '30' },
    ],
    services: ['Workflow Clarity Audit', 'Contract Ops Buildout'],
  },
  {
    id: 'sports-sponsorship',
    tag: 'Workflow Design',
    industry: 'Sports Organization',
    challenge:
      'A regional sports property was processing sponsorship agreements through a combination of email, shared drives, and informal approvals. Each deal required an average of 21 days from handshake to signed agreement. The team had no standard templates for common deal structures, meaning every agreement started from scratch.',
    approach:
      'We designed a standardized sponsorship agreement intake and approval workflow, created templated agreement structures for the 5 most common deal types, and implemented a tracking system with automatic reminder sequences for pending approvals.',
    result:
      'Time from handshake to executed agreement dropped from 21 days to 8 days. The team closed 40% more deals in the following quarter with the same headcount.',
    metrics: [
      { label: 'Cycle time reduction', value: '62%' },
      { label: 'More deals closed (next quarter)', value: '+40%' },
      { label: 'Common deal types templatized', value: '5 of 6' },
    ],
    services: ['Workflow Clarity Audit', 'Contract Ops Buildout'],
  },
  {
    id: 'saas-compliance',
    tag: 'Post-Award Compliance',
    industry: 'SaaS Company',
    challenge:
      'A B2B SaaS company had accumulated 45+ active vendor and customer agreements with no system for tracking renewal dates, obligation milestones, or compliance requirements. Two renewals had been missed in the prior year, and one compliance deadline had been flagged late by a customer. The team had no visibility into their active agreement landscape.',
    approach:
      'We built a post-award compliance system that inventoried all active agreements, extracted key obligations and dates, set up an automated tracking and notification system, and defined the workflow for managing renewals and compliance checks going forward.',
    result:
      'Zero missed obligations in the 12 months following implementation. Leadership went from zero visibility to a weekly dashboard view of all active agreement status.',
    metrics: [
      { label: 'Missed obligations since launch', value: '0' },
      { label: 'Agreements in active tracking', value: '45+' },
      { label: 'Hours/week saved in manual tracking', value: '6' },
    ],
    services: ['Post-Award Compliance Layer'],
  },
]

export default function CaseStudiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-950 py-24 pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
            Results
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6 max-w-3xl leading-tight">
            Operational leverage, in the real world.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            These are representative examples of the types of results R3 LLC has delivered. Details
            are illustrative to protect client confidentiality.
          </p>
        </div>
      </section>

      {/* Studies */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          {studies.map((study) => (
            <div key={study.id} className="border border-zinc-200 rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="bg-zinc-50 px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
                    {study.tag}
                  </span>
                  <span className="text-sm text-zinc-500">{study.industry}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {study.services.map((service) => (
                    <span
                      key={service}
                      className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Narrative */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                        The Challenge
                      </p>
                      <p className="text-zinc-600 leading-relaxed text-sm">{study.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                        Our Approach
                      </p>
                      <p className="text-zinc-600 leading-relaxed text-sm">{study.approach}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                        The Outcome
                      </p>
                      <p className="text-zinc-800 font-medium leading-relaxed text-sm">
                        {study.result}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    {study.metrics.map((metric) => (
                      <div key={metric.label} className="bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                        <p className="text-3xl font-black text-zinc-950 mb-1">{metric.value}</p>
                        <p className="text-xs text-zinc-500">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="bg-zinc-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white border border-zinc-200 rounded-2xl p-10">
            <p className="text-zinc-400 text-sm font-medium mb-3">Client testimonials</p>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We&apos;re building this section as client relationships develop.{' '}
              <Link href="/contact" className="text-brand-600 hover:underline font-medium">
                Reach out
              </Link>{' '}
              if you&apos;d like a reference conversation with a current client.
            </p>
          </div>
        </div>
      </section>

      <ConsultationCTA />
    </>
  )
}
