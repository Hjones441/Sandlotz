import Link from 'next/link'
import { ShoppingCart, Star, Zap, TrendingUp, Timer, ShieldCheck, AlertTriangle } from 'lucide-react'

const BOOST_RULES = [
  {
    icon: Timer,
    title: 'Frequency Limits',
    body: 'You can only boost a specific listing once every 24 hours. This encourages thoughtful promotion over spamming the button.',
  },
  {
    icon: TrendingUp,
    title: 'Diminishing Returns',
    body: 'Repeatedly boosting the same item without updating it may have a reduced effect over time. Fresh listings get more attention.',
  },
  {
    icon: Zap,
    title: 'Boosts Expire',
    body: 'A standard boost automatically expires after 48–72 hours. This keeps the marketplace dynamic and requires users to re-engage to stay visible.',
  },
  {
    icon: ShieldCheck,
    title: 'Visibility Queue',
    body: 'Only a certain number of listings can have premium "top-of-page" placement at once. Boosts place you in a rotating queue for these valuable spots.',
  },
]

export default function MarketplaceGuidePage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Hero */}
        <div className="rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 p-10 mb-12 text-center">
          <h1 className="text-5xl font-black text-white mb-5">Marketplace Guide</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Your hub for buying, selling, and promoting gear, events, and services. Here&apos;s how to make the most of it.
          </p>
        </div>

        {/* What You Can Post */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">What You Can Post</h2>
          </div>
          <hr className="border-white/20 mb-5" />
          <p className="text-white/70 text-sm mb-5">The marketplace is for more than just used gear. You can list:</p>
          <ul className="space-y-4">
            {[
              { label: 'Gear', body: 'New or used equipment, from basketballs to yoga mats.' },
              { label: 'Events', body: 'Announce a pickup game, a local tournament, or a group run.' },
              { label: 'Services', body: 'Offer coaching, personal training, or other sports-related services. Trainers and gyms can promote their expertise and facilities.' },
              { label: 'Community Posts', body: 'Looking for a doubles partner, starting a new team, or are you a gym announcing a new class schedule? Post it here.' },
            ].map(({ label, body }) => (
              <li key={label} className="flex gap-3 text-sm text-white/80">
                <span className="text-white/40 flex-shrink-0">•</span>
                <span><span className="font-bold text-white">{label}:</span> {body}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Promoting with Boosts */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Promoting Your Listing with Boosts</h2>
          </div>
          <hr className="border-white/20 mb-5" />
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            You earn PlayPoints from your workouts. You can spend those points to &ldquo;boost&rdquo; your listings, giving
            them more visibility in search results and on the marketplace page. Higher-tier members (All-Star and
            Legend) get free monthly boosts and even unlimited opportunities to boost.
          </p>

          {/* Info callout */}
          <div className="flex gap-3 rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 p-5 mb-8">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-bold text-sm mb-1">What does &ldquo;Unlimited Boosts&rdquo; really mean?</p>
              <p className="text-white/70 text-sm leading-relaxed">
                To keep the marketplace fair and prevent spam, our &ldquo;unlimited&rdquo; boosts for Legend-tier members are governed
                by smart controls. It&apos;s not about endless promotion, but endless <strong className="text-white">opportunity</strong> to promote smartly.
              </p>
            </div>
          </div>

          {/* Rules of Fair Boosting */}
          <h3 className="text-xl font-bold text-white mb-5">The Rules of Fair Boosting</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {BOOST_RULES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
                  <p className="text-white/70 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Transactions */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Safety &amp; Transactions</h2>
          </div>
          <hr className="border-white/20 mb-5" />
          <ul className="space-y-3">
            <li className="flex gap-3 text-white/80 text-sm"><span className="text-white/40 flex-shrink-0">•</span>For safety, always arrange to meet in well-lit, public places.</li>
            <li className="flex gap-3 text-white/80 text-sm"><span className="text-white/40 flex-shrink-0">•</span>Sandlotz is a venue; we are not part of the transaction. The agreement is between the buyer and seller.</li>
            <li className="flex gap-3 text-white/80 text-sm"><span className="text-white/40 flex-shrink-0">•</span>All payments are processed securely through Stripe. We never see your card details.</li>
            <li className="flex gap-3 text-white/80 text-sm">
              <span className="text-white/40 flex-shrink-0">•</span>
              Read our{' '}
              <Link href="/legal/terms" className="text-yellow-400 hover:underline font-semibold">Terms of Service</Link>
              {' '}for full details.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Ready to list your first item?</h2>
          <p className="text-white/70 text-base mb-8">Turn your unused gear into cash or find your next training partner today.</p>
          <Link
            href="/marketplace"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-10 py-3.5 rounded-xl text-base transition-all shadow-lg"
          >
            Go to the Marketplace
          </Link>
        </div>
      </div>
    </main>
  )
}
