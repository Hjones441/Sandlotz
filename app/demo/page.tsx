import Link from 'next/link'
import { Play, Zap, TrendingUp, Trophy, Gift, ShoppingCart, CheckCircle } from 'lucide-react'

const DEMO_STEPS = [
  {
    icon: Zap,
    step: '01',
    title: 'Log Your First Activity',
    body: 'Head to Log Activity and record any sport — a run, gym session, basketball game, swim. Add duration and intensity. Takes 30 seconds.',
    cta: { label: 'Log Activity', href: '/log-activity' },
  },
  {
    icon: TrendingUp,
    step: '02',
    title: 'Watch Your Score Update',
    body: 'The moment you save, your SweatScore and PlayerPoints are calculated. Head to the leaderboard and find your name.',
    cta: { label: 'View Leaderboard', href: '/leaderboard' },
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Climb the Ranks',
    body: 'Log consistently each week to build your streak multiplier. Advance through tiers from Rookie to Legend as your SweatScore grows.',
    cta: { label: 'Learn About Scoring', href: '/about/scoring-verification' },
  },
  {
    icon: Gift,
    step: '04',
    title: 'Spend Your PlayerPoints',
    body: 'Bank enough PlayerPoints and redeem them for brand perks — gear discounts, event tickets, free coaching sessions, and more.',
    cta: { label: 'Browse Perks', href: '/perks' },
  },
  {
    icon: ShoppingCart,
    step: '05',
    title: 'Use the Marketplace',
    body: 'Buy or sell gear, find a coach, or post a local pickup game. Active athletes get algorithmic visibility boosts — no ad spend needed.',
    cta: { label: 'Visit Marketplace', href: '/marketplace' },
  },
]

const FEATURES = [
  'Free to join — always',
  'Connect Strava or Apple Health',
  'Local & global leaderboards',
  'Brand-sponsored challenges',
  'Gear marketplace',
  'Real-time score updates',
]

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-semibold mb-5">
            <Play className="w-4 h-4" />
            Interactive Demo
          </div>
          <h1 className="text-5xl font-black text-white mb-5">See Sandlotz in Action</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Walk through the core Sandlotz experience in five steps — from logging your first workout to
            redeeming real rewards.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-5 mb-16">
          {DEMO_STEPS.map(({ icon: Icon, step, title, body, cta }) => (
            <div
              key={step}
              className="flex gap-5 rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 p-6"
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <span className="text-xs font-black text-yellow-400/40">{step}</span>
                <div className="p-2.5 bg-yellow-400/10 rounded-xl">
                  <Icon className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-lg mb-1">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">{body}</p>
                <Link
                  href={cta.href}
                  className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  {cta.label} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature checklist */}
        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/30 p-6 mb-14">
          <h2 className="text-xl font-black text-white mb-4">Everything Included — Free</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Play?</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Create your free account and start earning points for workouts you&apos;re already doing.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-10 py-3.5 rounded-xl text-base transition-all shadow-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>
    </main>
  )
}
