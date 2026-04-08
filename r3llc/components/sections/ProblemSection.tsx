import Link from 'next/link'
import { XCircle } from 'lucide-react'

const problems = [
  {
    title: 'Contracts stuck in email for weeks',
    description:
      'No intake system, no routing logic, no visibility into where a deal actually stands.',
  },
  {
    title: 'Manual approvals creating bottlenecks',
    description:
      'Every agreement needs four people to find it before one person can act on it.',
  },
  {
    title: 'Post-award obligations tracked in spreadsheets',
    description:
      'Deliverables fall through the cracks. Compliance milestones get missed.',
  },
  {
    title: 'Coordination burning leadership time',
    description:
      'The CEO is copy-pasting context. The ops team is playing traffic controller.',
  },
  {
    title: 'No standard process — every deal is different',
    description:
      "When a process lives in one person's head, it doesn't scale.",
  },
  {
    title: "You've outgrown what used to work",
    description:
      'What held together at 5 people breaks at 25. Execution debt is compounding.',
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-zinc-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Sound familiar?
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-4 leading-tight">
            This is what operational drag looks like.
          </h2>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Most companies don't have a talent problem. They have a systems design problem. These are
            the signals.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-3">
                <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-zinc-900 font-semibold text-sm mb-2 leading-snug">
                    {problem.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer nudge */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm">
            If two or more of these describe your situation,{' '}
            <Link href="/contact" className="text-brand-600 font-semibold hover:underline">
              let&apos;s talk
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
