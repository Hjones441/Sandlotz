'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Gift, Star, Zap, Trophy, Clock, Lock, AlertCircle, ExternalLink } from 'lucide-react'

const PERK_CATEGORIES = ['All', 'Gear', 'Events', 'Services', 'Digital', 'Premium']

const PERKS = [
  {
    id: '1',
    title: '20% Off Nike Gear',
    cost: 500,
    brand: 'Nike',
    category: 'Gear',
    emoji: '👟',
    desc: 'Discount code for Nike.com. Valid on full-price items. Expires 30 days after redemption.',
    sponsored: true,
    available: true,
  },
  {
    id: '2',
    title: 'Free Protein Shake',
    cost: 200,
    brand: 'GNC',
    category: 'Services',
    emoji: '💪',
    desc: 'Redeemable at any GNC location. One per account. Present app on pickup.',
    sponsored: true,
    available: true,
  },
  {
    id: '3',
    title: 'Columbus FC Tickets',
    cost: 1000,
    brand: 'Columbus FC',
    category: 'Events',
    emoji: '⚽',
    desc: '2 tickets to a home match. Seat selection subject to availability.',
    sponsored: true,
    available: true,
  },
  {
    id: '4',
    title: 'Fitness Assessment',
    cost: 750,
    brand: 'FitLab',
    category: 'Services',
    emoji: '📊',
    desc: 'Full performance analysis session — VO2 max, body comp, movement screening.',
    sponsored: false,
    available: true,
  },
  {
    id: '5',
    title: '$25 SportChek Credit',
    cost: 300,
    brand: 'SportChek',
    category: 'Digital',
    emoji: '🏬',
    desc: 'In-store or online credit. No minimum purchase required.',
    sponsored: false,
    available: true,
  },
  {
    id: '6',
    title: 'Sandlotz Pro — 1 Month',
    cost: 400,
    brand: 'Sandlotz',
    category: 'Premium',
    emoji: '⭐',
    desc: 'Unlock all premium features: advanced analytics, unlimited listing boosts, early challenge access, exclusive badges.',
    sponsored: false,
    available: true,
  },
  {
    id: '7',
    title: 'Garmin Watch Raffle',
    cost: 150,
    brand: 'Garmin',
    category: 'Gear',
    emoji: '⌚',
    desc: 'Enter to win a Garmin Forerunner 265. Drawing every Friday. Each entry = 1 ticket.',
    sponsored: true,
    available: true,
    flash: true,
    flashEnds: '2h 14m',
  },
  {
    id: '8',
    title: '1-on-1 Coaching Session',
    cost: 600,
    brand: 'CoachHub',
    category: 'Services',
    emoji: '🏀',
    desc: '60-minute personalized coaching with a certified trainer. Book within 7 days of redemption.',
    sponsored: false,
    available: false,
  },
]

const DISCLAIMER_ITEMS = [
  'PlayerPoints have no cash value and are not transferable.',
  'Redemptions are final. Points cannot be refunded once a perk is claimed.',
  'Sandlotz reserves the right to modify or remove perks at any time.',
  'Points earned through fraudulent activity will be voided and accounts suspended.',
  'Perks are fulfilled by third-party sponsors. Sandlotz is not responsible for sponsor fulfillment delays.',
  'Monthly point resets apply to streak bonus points only. Base earned points never expire.',
]

export default function PerksPage() {
  const { profile } = useAuth()
  const [activeCategory, setActiveCategory] = useState('All')

  const balance = profile?.totalScore ?? 0
  const monthlyEarned = 340 // mock — would come from Firestore aggregation
  const monthlyMax = 500

  const filtered = PERKS.filter(p => activeCategory === 'All' || p.category === activeCategory)

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Gift className="w-8 h-8 text-yellow-400" />
        <h1 className="text-3xl font-black text-white">Perks Store</h1>
      </div>
      <p className="text-white/50 mb-8">Spend your PlayerPoints on real rewards from brand partners.</p>

      {/* Balance + monthly alert */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Balance card */}
        <div className="sz-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">Your Balance</span>
          </div>
          <p className="text-4xl font-black text-yellow-400 mb-1">{balance.toLocaleString()}</p>
          <p className="text-white/50 text-sm">PlayerPoints available</p>
          <Link href="/log-activity" className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-bold transition-colors">
            + Earn more points →
          </Link>
        </div>

        {/* Monthly earnings alert */}
        <div className="sz-card p-6 border-yellow-400/20 bg-yellow-400/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">Monthly Earning Progress</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">{monthlyEarned} pts earned this month</span>
            <span className="text-yellow-400 font-bold">{monthlyMax} pt cap</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full">
            <div
              className="h-2 bg-yellow-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (monthlyEarned / monthlyMax) * 100)}%` }}
            />
          </div>
          <p className="text-white/40 text-xs mt-2">
            Streak bonus points reset on the 1st of each month. Base points never expire.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PERK_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-yellow-400 text-purple-900 font-bold'
                : 'text-white/60 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Perks grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {filtered.map(perk => {
          const canAfford = balance >= perk.cost
          return (
            <div
              key={perk.id}
              className={`sz-card overflow-hidden flex flex-col ${!perk.available ? 'opacity-60' : ''}`}
            >
              {/* Flash auction banner */}
              {perk.flash && (
                <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-4 py-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">Flash Auction ends in {perk.flashEnds}</span>
                </div>
              )}

              {/* Image placeholder */}
              <div className="bg-white/10 aspect-video flex items-center justify-center relative">
                <span className="text-5xl">{perk.emoji}</span>
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {perk.sponsored && (
                    <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">Sponsored</span>
                  )}
                  {!perk.available && (
                    <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Coming Soon
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-white/40 mb-1">{perk.brand} · {perk.category}</p>
                <p className="text-white font-bold mb-1">{perk.title}</p>
                <p className="text-white/60 text-sm mb-4 flex-1 leading-relaxed">{perk.desc}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-black">{perk.cost.toLocaleString()}</span>
                    <span className="text-white/40 text-xs">pts</span>
                  </div>
                  {!canAfford && perk.available && (
                    <span className="text-white/40 text-xs">
                      Need {(perk.cost - balance).toLocaleString()} more
                    </span>
                  )}
                </div>

                <button
                  disabled={!perk.available || !canAfford}
                  className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {!perk.available ? (
                    <><Lock className="w-4 h-4" /> Coming Soon</>
                  ) : !canAfford ? (
                    <><Zap className="w-4 h-4" /> Not Enough Points</>
                  ) : perk.flash ? (
                    <><Clock className="w-4 h-4" /> Place Bid</>
                  ) : (
                    <><Gift className="w-4 h-4" /> Redeem Now</>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Earn more CTA */}
      <div className="sz-card p-6 flex flex-col sm:flex-row items-center gap-5 mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">Want More Points?</span>
          </div>
          <p className="text-white/60 text-sm">Log activities, complete quests, and join sponsored challenges to stack PlayerPoints fast.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/log-activity" className="btn-primary text-sm !py-2 !px-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Log Activity
          </Link>
          <Link href="/leaderboard" className="btn-ghost text-sm !py-2 !px-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Leaderboard
          </Link>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="sz-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-white/40" />
          <span className="text-white/50 text-sm font-semibold">PlayerPoints Terms & Conditions</span>
        </div>
        <ul className="space-y-2">
          {DISCLAIMER_ITEMS.map((item, i) => (
            <li key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed">
              <span className="shrink-0 text-white/20">•</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-white/30 text-xs mt-4 border-t border-white/10 pt-4">
          For full terms, visit{' '}
          <Link href="/terms" className="text-yellow-400/60 hover:text-yellow-400 underline">sandlotz.com/terms</Link>
          . Questions? Email{' '}
          <a href="mailto:support@sandlotz.com" className="text-yellow-400/60 hover:text-yellow-400 underline">support@sandlotz.com</a>
        </p>
      </div>
    </div>
  )
}
