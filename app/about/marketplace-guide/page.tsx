import Link from 'next/link'
import { ShoppingCart, Tag, CalendarDays, Dumbbell, Star, TrendingUp } from 'lucide-react'

const LISTING_TYPES = [
  {
    icon: Tag,
    title: 'Gear & Equipment',
    body: 'Buy and sell used or new sports gear — from running shoes to weights to team uniforms. Listings include photos, condition rating, price, and seller SweatScore for trust.',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    body: 'Post local pickup games, tournaments, run clubs, or fitness classes. Free to list. Players can RSVP directly through the app, and active users get natural visibility boosts.',
  },
  {
    icon: Dumbbell,
    title: 'Coaching Services',
    body: 'Personal trainers, coaches, and fitness gyms can list their services with pricing and availability. Use PlayerPoints to promote your listing to the top of category searches.',
  },
]

const STEPS = [
  { step: '01', title: 'Create a Listing', body: 'Choose your listing type (Gear, Event, or Service), add photos, set your price or details, and publish. Takes under 2 minutes.' },
  { step: '02', title: 'Boost with PlayerPoints', body: 'Spend PlayerPoints to push your listing higher in search results and the community feed. More active athletes earn more points to spend.' },
  { step: '03', title: 'Connect & Transact', body: 'Buyers message sellers directly through the in-app chat. Coordinate pickup, shipping, or session booking without leaving Sandlotz.' },
  { step: '04', title: 'Build Your Reputation', body: 'Completed transactions earn you seller reviews. A strong review history and high SweatScore builds trust and drives more interest to your listings.' },
]

export default function MarketplaceGuidePage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-5">Marketplace Guide</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            The Sandlotz Marketplace connects athletes, coaches, and fitness businesses in one place.
            Your athletic activity directly boosts your visibility — the more you play, the more you get seen.
          </p>
        </div>

        {/* Listing types */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">What You Can List</h2>
        <hr className="border-white/20 mb-6" />
        <div className="space-y-6 mb-14">
          {LISTING_TYPES.map(({ icon: Icon, title, body }) => (
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

        {/* How it works steps */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">How It Works</h2>
        <hr className="border-white/20 mb-6" />
        <div className="space-y-4 mb-14">
          {STEPS.map(s => (
            <div key={s.step} className="flex gap-5 rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 p-5">
              <span className="text-3xl font-black text-yellow-400/30 flex-shrink-0 leading-none">{s.step}</span>
              <div>
                <h3 className="text-white font-bold mb-1">{s.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Activity = visibility callout */}
        <div className="flex gap-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/5 px-5 py-4 mb-14">
          <TrendingUp className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-semibold text-sm mb-1">Activity = Visibility</p>
            <p className="text-white/70 text-sm leading-relaxed">
              Active Sandlotz users get a natural algorithmic boost in marketplace search results. Log workouts consistently to keep your listings at the top — no extra spend required.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to List?</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Create your free account to start buying, selling, and connecting with the Sandlotz athlete community.
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
