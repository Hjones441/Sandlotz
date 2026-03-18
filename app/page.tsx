import Link from 'next/link'
import { Trophy, Zap, Gift, Users, TrendingUp, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 text-center"
        style={{ background: 'linear-gradient(160deg, #1E1040 0%, #2D1B69 50%, #1E1040 100%)' }}>

        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] rounded-full
                          bg-brand-purple opacity-20 blur-[120px]" />
        </div>

        <p className="relative mb-4 text-sm font-semibold tracking-widest text-brand-yellow uppercase">
          Columbus, OH • Est. 2025
        </p>

        <h1 className="relative mb-6 text-6xl sm:text-8xl font-black tracking-tight leading-none">
          <span className="text-gold">SANDLOTZ</span>
        </h1>

        <p className="relative mx-auto mb-10 max-w-xl text-lg text-white/70">
          The AI-powered sports marketplace where your performance earns real rewards.
          Log workouts, climb the leaderboard, and unlock brand perks.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-center">
            Start Competing — It&apos;s Free
          </Link>
          <Link href="/leaderboard" className="btn-ghost text-center">
            View Leaderboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="relative mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { label: 'Athletes', value: '1K+' },
            { label: 'Activities Logged', value: '10K+' },
            { label: 'Perks Earned', value: '$50K+' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-brand-yellow">{s.value}</p>
              <p className="text-xs text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-brand-purple-dark">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-black mb-2">How It Works</h2>
          <p className="text-center text-white/50 mb-12">Three steps to start earning</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8 text-brand-yellow" />,
                title: 'Post',
                sub:   'Log Your Workout',
                desc:  'Record any sport — runs, lifts, swims, games. Every minute counts toward your Sandlotz Score™.',
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-brand-yellow" />,
                title: 'Promote',
                sub:   'Climb the Ranks',
                desc:  'Your score updates in real time. Compete locally in Columbus or go global against the world.',
              },
              {
                icon: <Gift className="w-8 h-8 text-brand-yellow" />,
                title: 'Play',
                sub:   'Spend Your PlayerPoints',
                desc:  'Redeem points for brand perks, gear discounts, event tickets, and exclusive challenges.',
              },
            ].map(item => (
              <div key={item.title} className="sz-card p-8 text-center">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-black mb-1">{item.title}</h3>
                <p className="text-brand-yellow text-sm font-semibold mb-3">{item.sub}</p>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20"
        style={{ background: 'linear-gradient(180deg, #1E1040 0%, #2D1B69 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-black mb-12">Built for Competitors</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Trophy className="w-6 h-6" />,   title: 'Sandlotz Score™',     desc: 'Universal athlete ranking based on sport, duration, intensity, and distance.' },
              { icon: <Users  className="w-6 h-6" />,   title: 'Local Leaderboards',  desc: 'See where you stack up in Columbus and your city. Filter by sport.' },
              { icon: <Star   className="w-6 h-6" />,   title: 'Brand Challenges',    desc: 'Sponsored fitness challenges with real prize pools and rewards.' },
              { icon: <Gift   className="w-6 h-6" />,   title: 'Perks Marketplace',   desc: 'Spend PlayerPoints on gear, experiences, and brand-sponsored deals.' },
              { icon: <Zap    className="w-6 h-6" />,   title: 'All Sports',          desc: 'Running, cycling, swimming, lifting, basketball, soccer, and more.' },
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Real-time Scores', desc: 'Your score updates the moment you log a workout. No waiting.' },
            ].map(f => (
              <div key={f.title} className="sz-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-brand-yellow">{f.icon}</div>
                  <h3 className="font-bold">{f.title}</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center bg-brand-purple-dark">
        <div className="max-w-xl mx-auto sz-card p-12">
          <h2 className="text-3xl font-black mb-4">Ready to Dominate?</h2>
          <p className="text-white/60 mb-8">
            Join thousands of athletes in Columbus and beyond. Free to start — premium features unlock as you grow.
          </p>
          <Link href="/signup" className="btn-primary inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

    </div>
  )
}
