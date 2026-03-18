import Link from 'next/link'
import { Trophy, MapPin, Globe, Filter, Medal, RefreshCw } from 'lucide-react'

const HOW_ITEMS = [
  {
    icon: Trophy,
    title: 'Ranked by SweatScore™',
    body: 'Every athlete is ranked by their cumulative SweatScore — a lifetime metric that only grows. The more you log, the higher you climb. There is no shortcut; only consistent effort moves the needle.',
  },
  {
    icon: MapPin,
    title: 'Local Leaderboards',
    body: 'Compete within your city. Local boards are filtered to athletes in your metro area, giving you a real sense of where you stand against neighbours and gym rivals. Columbus, Cleveland, Cincinnati and more.',
  },
  {
    icon: Globe,
    title: 'Global Leaderboards',
    body: 'Think you have what it takes globally? The global board puts you against every verified Sandlotz athlete worldwide — across all sports and all cities. Legends live here.',
  },
  {
    icon: Filter,
    title: 'Filter by Sport',
    body: 'Leaderboards can be filtered by sport so a runner competes with runners, a lifter with lifters. You can still see the all-sports board to see who logs the most overall volume.',
  },
  {
    icon: Medal,
    title: 'Tier Badges',
    body: 'Athlete tiers (Rookie → Bronze → Silver → Gold → Platinum → Legend) are displayed next to every leaderboard entry. Your tier is determined by your cumulative SweatScore milestone.',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Updates',
    body: 'The leaderboard refreshes as athletes log activities. Post a workout and watch your rank update within seconds. No manual syncing, no waiting until end of day.',
  },
]

const TIERS = [
  { name: 'Rookie',   range: '0 – 999 pts',      color: 'text-white/60' },
  { name: 'Bronze',   range: '1,000 – 4,999 pts', color: 'text-orange-400' },
  { name: 'Silver',   range: '5,000 – 14,999 pts',color: 'text-slate-300' },
  { name: 'Gold',     range: '15,000 – 39,999 pts',color: 'text-yellow-400' },
  { name: 'Platinum', range: '40,000 – 99,999 pts',color: 'text-cyan-300' },
  { name: 'Legend',   range: '100,000+ pts',       color: 'text-purple-300' },
]

export default function LeaderboardsExplainedPage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-5">Leaderboards Explained</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Sandlotz leaderboards are live, filterable rankings that show where every athlete stands.
            Local, global, or sport-specific — there is a board for every competitor.
          </p>
        </div>

        <div className="space-y-8 mb-14">
          {HOW_ITEMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg mb-1">{title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tier table */}
        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/30 overflow-hidden mb-14">
          <div className="px-6 py-4 border-b border-purple-400/20">
            <h2 className="text-xl font-black text-white">Athlete Tier Thresholds</h2>
          </div>
          <div className="divide-y divide-purple-400/20">
            {TIERS.map(t => (
              <div key={t.name} className="flex items-center justify-between px-6 py-3">
                <span className={`font-bold ${t.color}`}>{t.name}</span>
                <span className="text-white/60 text-sm">{t.range}</span>
              </div>
            ))}
          </div>
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
