import Link from 'next/link'
import { ShieldCheck, TrendingUp, Gift, ShoppingCart, CalendarDays, Check, MapPin, MessageSquare, Star, BarChart2 } from 'lucide-react'

const BRAND_CHANNELS = [
  {
    icon: ShieldCheck,
    title: 'Sponsored Perks',
    body: 'Drop 1,000 digital coupons for $1,000 — pay only on redemption. Premium store placement, countdown timers, and engagement tracking. Zero waste. Guaranteed action. Fully trackable.',
  },
  {
    icon: TrendingUp,
    title: 'Branded Challenges',
    body: 'Sponsor behavior, not banner ads. Example: "Burn 2,000 calories with Gatorade this week." Users earn badges, bonus points, and social bragging rights. Proven to increase engagement and brand favorability.',
  },
  {
    icon: Gift,
    title: 'Flash Drops & Auctions',
    body: 'Feature your gear in time-limited promos or point-based auctions. Build urgency. Reward top users. Launch new products with buzz.',
  },
  {
    icon: ShoppingCart,
    title: 'Marketplace Boosting',
    body: 'Sponsor listings or drop certified used gear into the resale economy. Example: "Adidas Verified Drop". Promote sustainability and drive recurring brand exposure.',
  },
  {
    icon: CalendarDays,
    title: 'Event Activations',
    body: 'QR code onboarding at gyms, races, and tournaments. Instant challenge enrollment + live lead capture. High-impact, real-time brand interaction.',
  },
]

const WHY_IT_WORKS = [
  { icon: ShieldCheck, title: 'Verified Data Only',       body: 'All activity must pass GPS, heart rate, or app-authenticated checks. No bots. No fluff.' },
  { icon: MessageSquare, title: 'Intent-Based Engagement', body: 'Every perk claim, challenge, and post is opt-in. That means real interest — not accidental clicks.' },
  { icon: MapPin,       title: 'Precision Targeting',     body: 'Segment users by ZIP code, sport, performance level, or community group.' },
  { icon: Star,         title: 'Brand-Safe Environment',  body: 'No toxicity. Just fitness, motivation, and meaningful reward moments.' },
]

const RESULTS = [
  '100% opt-in impressions',
  'Measurable redemption and engagement data',
  'Action-based pricing model',
  'Access to loyal, health-conscious consumers',
  'Embedded moments of pride and progress — where brands make real emotional connections',
]

const SCALE = [
  'Employer wellness expansion',
  'WHOOP, Garmin, and Oura integration',
  'AI-driven offer personalization',
  'Team leaderboards and coach dashboards',
  'Local partner rollout across gyms, schools, and rec leagues',
]

export default function WhySandlotzPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white mb-6">Why Sandlotz</h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            Sandlotz turns verified fitness activity into real-world commerce and brand engagement. Built
            for athletes of all levels, it combines a points-based reward system, gear marketplace, and local
            leaderboards into one high-retention platform. Users earn PlayerPoints for legitimate activity —
            and spend them on perks, gear boosts, and exclusive rewards.
          </p>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            But the real value is B2B: Sandlotz gives brands and sponsors a direct, measurable channel to
            reach active, geo-targeted users in health-first communities.
          </p>
        </div>

        {/* Smarter Channel */}
        <h2 className="text-2xl font-bold text-white mb-2">A Smarter Channel for Brands</h2>
        <hr className="border-white/20 mb-4" />
        <p className="text-white/70 text-sm mb-8">Modern advertising is noisy. Sandlotz offers guaranteed, action-based results.</p>
        <div className="grid sm:grid-cols-2 gap-5 mb-14">
          {BRAND_CHANNELS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <Icon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold mb-1">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Why It Works */}
        <h2 className="text-2xl font-bold text-white mb-2">Why It Works</h2>
        <hr className="border-white/20 mb-6" />
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {WHY_IT_WORKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="font-bold text-white">{title}:</span> {body}
              </p>
            </div>
          ))}
        </div>

        {/* Real Results */}
        <h2 className="text-2xl font-bold text-white mb-2">Real Results at Digital Cost</h2>
        <hr className="border-white/20 mb-4" />
        <p className="text-white/70 text-sm mb-4">You don&apos;t pay to be seen — you pay to be valued.</p>
        <ul className="space-y-2 mb-14">
          {RESULTS.map(r => (
            <li key={r} className="flex gap-3 text-white/80 text-sm">
              <span className="text-yellow-400 flex-shrink-0">•</span>{r}
            </li>
          ))}
        </ul>

        {/* Built for Scale */}
        <h2 className="text-2xl font-bold text-white mb-2">Built for Scale</h2>
        <hr className="border-white/20 mb-4" />
        <ul className="space-y-2 mb-14">
          {SCALE.map(s => (
            <li key={s} className="flex gap-3 text-white/80 text-sm">
              <span className="text-yellow-400 flex-shrink-0">•</span>{s}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Sandlotz is more than an app — it&apos;s a movement commerce engine.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-2">
            Whether you&apos;re a local gym or a national brand, we help you reach the right athlete at the right time — with value that&apos;s real and measurable.
          </p>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            For a detailed breakdown of partnership opportunities, visit our Partner Hub.
          </p>
          <Link
            href="/investors/partnership"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-10 py-3.5 rounded-xl text-base transition-all shadow-lg"
          >
            Go to Partner Hub
          </Link>
        </div>
      </div>
    </main>
  )
}
