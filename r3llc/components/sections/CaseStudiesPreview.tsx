import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const studies = [
  {
    industry: 'Engineering Firm',
    title: 'Reduced contract cycle time by 59% with an AI-enabled intake and approval system',
    outcome: '59% faster turnaround',
    category: 'Contract Ops',
  },
  {
    industry: 'Sports Organization',
    title:
      'Eliminated 3 weeks of manual work per sponsorship deal with a standardized workflow',
    outcome: '3 weeks saved per deal',
    category: 'Workflow Design',
  },
  {
    industry: 'SaaS Company',
    title:
      'Built a post-award compliance system that eliminated missed obligations entirely',
    outcome: '0 missed milestones',
    category: 'Compliance Ops',
  },
]

export default function CaseStudiesPreview() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Client Results
            </p>
            <h2 className="text-4xl font-black tracking-tighter text-zinc-950 leading-tight">
              What operational leverage looks like.
            </h2>
          </div>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-600 font-medium transition-colors shrink-0"
          >
            View all results <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {studies.map((study) => (
            <div
              key={study.title}
              className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 hover:shadow-md hover:border-brand-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
                  {study.category}
                </span>
                <span className="text-xs text-zinc-400">{study.industry}</span>
              </div>
              <h3 className="text-zinc-800 font-semibold text-sm leading-snug mb-5">
                {study.title}
              </h3>
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-200">
                <span className="text-xs text-zinc-400">Result:</span>
                <span className="text-xs font-bold text-zinc-950">{study.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
