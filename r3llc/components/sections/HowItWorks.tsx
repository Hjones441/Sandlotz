const steps = [
  {
    number: '01',
    title: 'Discovery & Current State Audit',
    description:
      'We spend the first 1–2 weeks mapping your workflows, interviewing your team, and identifying exactly where friction lives. You get a clear picture of the problem before we propose any solution.',
    outcomes: ['Workflow map', 'Friction inventory', 'Priority fix list'],
  },
  {
    number: '02',
    title: 'System Design & Build',
    description:
      "We design the solution — whether that's a contract ops workflow, an intake system, AI-enabled review guardrails, or a full process redesign. We build it with your team, not over them.",
    outcomes: ['System architecture', 'Implementation plan', 'Tool configuration'],
  },
  {
    number: '03',
    title: 'Launch, Train & Operate',
    description:
      'We implement, document, and train your team. Most clients see operational improvement within 30 days. We stay engaged for questions, adjustments, and ongoing support as needed.',
    outcomes: ['Live system', 'SOPs & documentation', 'Team training'],
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-zinc-950 py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-3">
            How We Work
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
            A process built for results, not process.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            No endless discovery phases. No bloated project plans. We move fast, document
            thoroughly, and focus on outcomes your team can actually use.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-7xl font-black text-zinc-900 mb-4 leading-none select-none">
                {step.number}
              </div>
              <h3 className="text-white font-bold text-xl mb-3 leading-snug">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-5">{step.description}</p>
              <ul className="space-y-2">
                {step.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
