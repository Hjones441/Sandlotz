import Link from 'next/link'
import { Trophy, Gift, ShieldCheck, Info } from 'lucide-react'

export default function LeaderboardsExplainedPage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Hero */}
        <div className="rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 p-10 mb-12 text-center">
          <h1 className="text-5xl font-black text-white mb-5">Leaderboards, Quests &amp; Challenges</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Our platform is built on a fair and transparent system that rewards your hustle. Here&apos;s a
            breakdown of how it works.
          </p>
        </div>

        {/* Two Types of Points */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">The Two Types of Points</h2>
          </div>
          <hr className="border-white/20 mb-5" />
          <p className="text-white/70 text-sm mb-6">
            Every time you log a verified activity, our Sandlotz Simple-Score™ formula awards you two types of points:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-lg">↗</span>
                <h3 className="text-white font-bold text-lg">SweatScore</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                This is your lifetime achievement score. It determines your rank on leaderboards and fuels
                your progression in your PlayerPath. It never decreases.
              </p>
            </div>
            <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-bold text-lg">PlayerPoints</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                This is your currency. You earn them from workouts and completing quests, and you spend them
                on perks, marketplace boosts, and auction bids. This is the number you see in your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Quests & Challenges */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Quests &amp; Challenges</h2>
          <hr className="border-white/20 mb-5" />
          <p className="text-white/70 text-sm leading-relaxed">
            Quests are small, gamified missions designed to keep you motivated and reward your consistency
            (e.g., &ldquo;Log 3 workouts this week&rdquo;). Challenges are larger, time-bound events, often sponsored by
            brands, where you can compete for exclusive prizes and bonus points.
          </p>
        </div>

        {/* How We Keep It Fair */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">How We Keep It Fair</h2>
          </div>
          <hr className="border-white/20 mb-5" />
          <p className="text-white/70 text-sm mb-4">
            To maintain the integrity of our leaderboards and ensure a level playing field, we&apos;ve implemented several safeguards:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              'Our unique Sandlotz Simple-Score™ formula analyzes every log with GPS, heart rate, and movement data to confirm its authenticity.',
              'Fake or manipulated entries get flagged automatically by our system.',
              'Because our data is trustworthy, sponsors are confident in offering real rewards on the platform.',
            ].map(item => (
              <li key={item} className="flex gap-3 text-white/80 text-sm">
                <span className="text-white/40 flex-shrink-0">•</span>{item}
              </li>
            ))}
          </ul>

          {/* Pro Tip */}
          <div className="flex gap-3 rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 px-5 py-4">
            <Info className="w-5 h-5 text-white/50 flex-shrink-0 mt-0.5" />
            <p className="text-white/70 text-sm leading-relaxed">
              <span className="font-bold text-white">Pro Tip!</span>{' '}
              Workouts logged via verified devices (like Strava, Apple Health, or Garmin) always earn a higher
              SweatScore multiplier than manual entries.
            </p>
          </div>
        </div>

        {/* Technical details CTA */}
        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-10 text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-3">Want the technical details?</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-lg mx-auto mb-6">
            For a deep dive into our scoring formula, multipliers, and anti-cheat measures, check out our
            official Scoring &amp; Verification Policy.
          </p>
          <Link
            href="/about/scoring-verification"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-10 py-3 rounded-xl text-sm transition-all shadow-lg"
          >
            View Scoring Policy
          </Link>
        </div>

        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Climb?</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Log your first activity and claim your spot on the leaderboard today.
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
