import Link from 'next/link'
import { Trophy, TrendingUp, Coins, ShoppingCart, Zap, Star, Check, Diamond } from 'lucide-react'

const PLANS = [
  {
    name: 'Rookie',
    price: '$0',
    period: 'month',
    tagline: 'First-time users, casual athletes, students, and weekend warriors.',
    icon: Check,
    cta: 'Get Started for Free',
    features: [
      'Join public challenges (e.g., city-wide or sport-based quests)',
      'Access basic leaderboards (by city, age, sport)',
      'Participate in open quests (e.g., "Run 10 miles this week")',
      'Earn standard PlayPoints, streak badges, and community engagement credits',
      'View but not host custom group challenges',
    ],
    highlight: false,
  },
  {
    name: 'All-Star',
    price: '$4.99',
    period: 'month',
    tagline: 'Consistent users, team players, and gear resellers.',
    icon: Star,
    cta: 'Upgrade to All-Star',
    features: [
      'All Rookie features, plus:',
      'Join exclusive brand challenges with prize incentives',
      'Eligible for high-tier rewards in quests and raffles',
      'Create custom groups (up to 10 people) to host private challenges',
      'Earn bonus PlayPoints for group streaks and completion',
      'Priority visibility on leaderboards within your sport or ZIP code',
    ],
    highlight: true,
  },
  {
    name: 'Legend',
    price: '$14.99',
    period: 'month',
    tagline: 'Captains, coaches, gym leaders, influencers, and competitive athletes.',
    icon: Diamond,
    cta: 'Become a Legend',
    features: [
      'All All-Star features, plus:',
      'Unlimited group creation and challenge hosting',
      'Access to invite-only global and elite-tier quests',
      'Create branded challenges with Sandlotz support',
      'Custom leaderboards by gym, league, or employer',
      'Priority access to sponsor-backed prize pools and feature highlights',
      'Post custom workouts and download shareable reports for group insights',
      'Verified Challenge Leader status',
    ],
    highlight: false,
  },
]

const PRODUCTS = [
  {
    icon: Trophy,
    name: 'SweatScore™',
    tag: 'Your Lifetime Rank',
    description:
      'SweatScore is your permanent athletic ranking. Every verified workout you log contributes to this number — it never goes down. It reflects your dedication over time and determines where you stand on global and local leaderboards.',
    cta: { label: 'See Leaderboards', href: '/leaderboard' },
  },
  {
    icon: Coins,
    name: 'PlayerPoints',
    tag: 'Your In-App Currency',
    description:
      'PlayerPoints are earned alongside SweatScore but can be spent. Use them to boost marketplace listings, redeem perks from brand partners, enter paid challenges, or tip other athletes. They reset seasonally, encouraging consistent activity.',
    cta: { label: 'Browse Perks', href: '/perks' },
  },
  {
    icon: TrendingUp,
    name: 'PlayerPath',
    tag: 'Your Progression System',
    description:
      'PlayerPath is your personal journey from Rookie to Legend. As your SweatScore climbs, you unlock new tiers, earn badges, and gain access to exclusive features. Each tier comes with visible recognition and real rewards.',
    cta: { label: 'Log Activity', href: '/log-activity' },
  },
  {
    icon: ShoppingCart,
    name: 'Marketplace',
    tag: 'Buy, Sell & Connect',
    description:
      'The Sandlotz Marketplace lets athletes buy and sell gear, promote coaching services, and post local events. Active users with higher SweatScores get natural visibility boosts — making your effort pay off beyond the leaderboard.',
    cta: { label: 'Visit Marketplace', href: '/marketplace' },
  },
  {
    icon: Star,
    name: 'Quests & Challenges',
    tag: 'Gamified Missions',
    description:
      'Daily, weekly, and monthly Quests keep you on track with small achievable goals. Brand-sponsored Challenges bring time-limited competitions with real prizes — from gear to cash — open to all Sandlotz athletes.',
    cta: { label: 'Get Started', href: '/signup' },
  },
  {
    icon: Zap,
    name: 'Activity Feed',
    tag: 'Social Sports Hub',
    description:
      'Post workouts, find training partners, announce pickup games, or recruit teammates. The community feed surfaces the most active athletes, giving them natural reach to connect with coaches, brands, and other players.',
    cta: { label: 'Post Activity', href: '/log-activity' },
  },
]

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white mb-5">Products</h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            Sandlotz is built around a set of interlocking products that turn everyday athletic effort
            into a rewarding, competitive experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {PRODUCTS.map(({ icon: Icon, name, tag, description, cta }) => (
            <div
              key={name}
              className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/30 p-6 flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 bg-yellow-400/10 rounded-xl">
                  <Icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{name}</h2>
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">{tag}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed flex-1">{description}</p>
              <Link
                href={cta.href}
                className="self-start text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                {cta.label} →
              </Link>
            </div>
          ))}
        </div>

        {/* Pricing tiers */}
        <div className="mt-20 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Find the Plan That&apos;s Right for You</h2>
            <p className="text-white/80 text-base leading-relaxed max-w-2xl mx-auto">
              Whether you&apos;re just starting out or leading the pack, Sandlotz has a tier designed to
              amplify your hustle. Tiers are subscription levels that unlock special benefits and
              marketplace advantages.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, period, tagline, icon: Icon, features, highlight, cta }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 flex flex-col gap-4 ${
                  highlight
                    ? 'bg-purple-600/60 border-2 border-yellow-400/60 shadow-xl'
                    : 'bg-[#6D28D9]/40 border border-purple-400/30'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white/80" />
                  </div>
                  <h3 className="text-2xl font-black text-white">{name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{price}</span>
                    <span className="text-white/60 text-sm mb-1">/{period}</span>
                  </div>
                  <p className="text-white/70 text-sm leading-snug">{tagline}</p>
                </div>

                <hr className="border-white/20" />

                <div className="flex-1">
                  <p className="text-white font-bold text-sm mb-3">Included Group &amp; Challenge Features:</p>
                  <ul className="space-y-2">
                    {features.map(f => (
                      <li key={f} className="flex gap-2 text-sm text-white/80">
                        <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className={`mt-2 text-center font-bold px-6 py-3 rounded-xl text-sm transition-all ${
                    highlight
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-purple-900'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Play?</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Start free with the Rookie tier. Upgrade anytime as your hustle grows.
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
