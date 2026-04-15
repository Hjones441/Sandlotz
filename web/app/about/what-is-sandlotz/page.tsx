import Link from 'next/link'
import {
  HeartPulse,
  TrendingUp,
  Trophy,
  CheckSquare,
  ShoppingCart,
  Users,
} from 'lucide-react'

const ECOSYSTEM_ITEMS = [
  {
    icon: HeartPulse,
    title: 'Track Your Hustle & Earn Points',
    body: 'Connect wearables like Strava or Apple Health for automatic, verified tracking, or log activities manually. Our unique Sandlotz Simple-Score™ formula analyzes your effort to award two types of points: SweatScore (your lifetime rank) and PlayerPoints (your currency).',
  },
  {
    icon: TrendingUp,
    title: 'Advance Your PlayerPath',
    body: "Your lifetime SweatScore fuels your journey in your PlayerPath, your personal progression system. As you accumulate SweatScore, you'll advance from a Rookie to a Legend, unlocking new badges that showcase your dedication and bragging rights.",
  },
  {
    icon: Trophy,
    title: 'Climb the Ranks on Leaderboards',
    body: 'Compete on local and global leaderboards filtered by sport, age, and location. Your verified effort translates to your SweatScore, which determines your rank and allows you to see how you stack up against the community.',
  },
  {
    icon: CheckSquare,
    title: 'Complete Quests & Join Challenges',
    body: 'Stay motivated with gamified missions (Quests) that reward daily, weekly, and monthly consistency for goals like logging a certain number of workouts or burning a target number of calories. Join brand-sponsored Challenges to compete in time-bound fitness goals for exclusive prizes and bonus points.',
  },
  {
    icon: ShoppingCart,
    title: 'Engage in the Marketplace',
    body: 'Buy and sell gear, post events, or offer coaching services. Use your PlayerPoints to boost your listings for more visibility.',
  },
  {
    icon: Users,
    title: 'Build Your Community',
    body: 'Post in the community feed to find a doubles partner, announce a pickup game, or recruit for your team. Trainers and fitness gyms can promote their services, find clients, announce new class schedules, or promote their facilities. Active users get a natural boost in visibility.',
  },
]

export default function WhatIsSandlotz() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-6">What is Sandlotz</h1>
          <p className="text-white/90 text-lg leading-relaxed">
            Sandlotz gamifies your everyday fitness activity and turns it into real rewards. It&apos;s a
            social sports hub where you can track workouts, earn points through quests, and
            engage with a marketplace built for athletes.
          </p>
        </div>

        {/* Ecosystem section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 text-center mb-3">
            The Sandlotz Ecosystem
          </h2>
          <hr className="border-white/20 mb-8" />

          <p className="text-white/90 text-base leading-relaxed mb-10">
            Sandlotz operates on a simple yet powerful loop: move, earn, and engage. Every verified activity
            contributes to your standing in a thriving sports ecosystem of gear, perks, posts, and recognition.
          </p>

          <div className="space-y-8">
            {ECOSYSTEM_ITEMS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-5">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-yellow-400 font-bold text-lg mb-1">{title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-white/10 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Play?</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Create your free account to start tracking your activities, earning points, and
            connecting with a community that celebrates your hustle.
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
