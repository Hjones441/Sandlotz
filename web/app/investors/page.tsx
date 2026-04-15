import Link from 'next/link'
import { TrendingUp, Users, DollarSign, Globe, Zap, BarChart3 } from 'lucide-react'

const STATS = [
  { value: '$87B', label: 'Global fitness app market by 2030' },
  { value: '185M', label: 'Active fitness app users in North America' },
  { value: '3.2×', label: 'Avg. revenue per user vs. social media' },
  { value: '68%', label: 'Of gym-goers want rewards for working out' },
]

const TRACTION = [
  { icon: Users,    label: 'Athletes Registered',    value: '1,000+' },
  { icon: Zap,      label: 'Activities Logged',       value: '10,000+' },
  { icon: DollarSign, label: 'Perks Earned',          value: '$50,000+' },
  { icon: Globe,    label: 'Cities Active',           value: '4' },
]

const REVENUE_STREAMS = [
  {
    title: 'Marketplace Fees',
    body: 'A small transaction fee on gear sales and coaching bookings. Zero friction for buyers; sellers pay only on success.',
  },
  {
    title: 'PlayerPoints Boosts',
    body: 'Athletes can purchase bonus PlayerPoints to boost marketplace listings or enter premium challenges.',
  },
  {
    title: 'Brand Partnerships',
    body: 'Brands pay to sponsor Challenges, place perks in the rewards marketplace, and reach verified active athletes.',
  },
  {
    title: 'Premium Subscriptions',
    body: 'Sandlotz Pro unlocks advanced analytics, unlimited listing boosts, early challenge access, and exclusive badge tiers.',
  },
]

export default function InvestorsPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white mb-5">Investors</h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            Sandlotz is building the infrastructure layer for the active lifestyle economy —
            where verified athletic effort is the currency that unlocks real-world rewards.
          </p>
        </div>

        {/* Market stats */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">The Opportunity</h2>
        <hr className="border-white/20 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {STATS.map(s => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 text-center">
              <div className="text-3xl font-black text-yellow-400 mb-1">{s.value}</div>
              <div className="text-white/60 text-xs leading-snug">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Traction */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Early Traction</h2>
        <hr className="border-white/20 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {TRACTION.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 text-center flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-yellow-400" />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Business model */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Business Model</h2>
        <hr className="border-white/20 mb-6" />
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {REVENUE_STREAMS.map(r => (
            <div key={r.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-white font-bold mb-2">{r.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>

        {/* Vision */}
        <div className="flex gap-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 mb-14">
          <BarChart3 className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-2">The Vision</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              We are building toward a world where every athlete has a verified, portable fitness identity —
              a SweatScore passport that unlocks discounts, experiences, and opportunities anywhere they go.
              Sandlotz is the platform that issues and validates that identity.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Get in Touch</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Interested in learning more about Sandlotz investment opportunities?
            Reach out to the founding team directly.
          </p>
          <a
            href="mailto:investors@sandlotz.com"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-10 py-3.5 rounded-xl text-base transition-all shadow-lg"
          >
            Contact Investor Relations
          </a>
        </div>
      </div>
    </main>
  )
}
