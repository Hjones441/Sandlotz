'use client'

import Link from 'next/link'
import { ShoppingCart, Tag, CalendarDays, Dumbbell, Search, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = [
  { icon: Tag,          label: 'Gear & Equipment', count: 142 },
  { icon: CalendarDays, label: 'Events',            count: 38  },
  { icon: Dumbbell,     label: 'Coaching',          count: 61  },
]

const FEATURED = [
  { emoji: '👟', title: 'Nike Air Zoom Pegasus 40 — Size 10', type: 'Gear', price: '$95', seller: 'JordanR.', score: 4820, condition: 'Like New' },
  { emoji: '⚽', title: 'Columbus FC Pickup — Sunday 10am', type: 'Event', price: 'Free', seller: 'MarcusT.', score: 7310, condition: null },
  { emoji: '🏋️', title: '1-on-1 Strength Coaching — $60/hr',   type: 'Coaching', price: '$60/hr', seller: 'CoachKev', score: 12400, condition: null },
  { emoji: '🚴', title: 'Trek FX3 Road Bike — 54cm',           type: 'Gear', price: '$450', seller: 'AlexW.',  score: 3190, condition: 'Good' },
  { emoji: '🏃', title: 'Saturday Morning Run Club — 7am',     type: 'Event', price: 'Free', seller: 'RunCbus', score: 9800, condition: null },
  { emoji: '🥊', title: 'Boxing Fundamentals — 6-Week Course', type: 'Coaching', price: '$120', seller: 'BoxLabCbus', score: 18200, condition: null },
]

const TYPE_COLOR: Record<string, string> = {
  Gear:     'bg-blue-400/20 text-blue-300',
  Event:    'bg-green-400/20 text-green-300',
  Coaching: 'bg-yellow-400/20 text-yellow-300',
}

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-4">Marketplace</h1>
          <p className="text-white/70 text-lg">
            Buy gear, find events, and connect with coaches — all in one place.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-10">
          <div className="flex-1 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search gear, events, coaches..."
              className="bg-transparent flex-1 text-white placeholder-white/30 text-sm outline-none"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white/60 hover:text-white hover:bg-white/20 transition-all text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
          <Link
            href="/log-activity"
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold rounded-xl px-5 py-3 text-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            List Item
          </Link>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {CATEGORIES.map(({ icon: Icon, label, count }) => (
            <button
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-purple-400/30 bg-[#6D28D9]/30 hover:bg-[#6D28D9]/50 transition-all p-4 text-left"
            >
              <Icon className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white font-semibold text-sm">{label}</div>
                <div className="text-white/40 text-xs">{count} listings</div>
              </div>
            </button>
          ))}
        </div>

        {/* Featured listings */}
        <h2 className="text-xl font-black text-white mb-4">Featured Listings</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {FEATURED.map(item => (
            <div
              key={item.title}
              className="rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 hover:bg-[#6D28D9]/40 transition-all p-5 cursor-pointer"
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold text-sm leading-snug">{item.title}</h3>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[item.type]}`}>
                  {item.type}
                </span>
                {item.condition && (
                  <span className="text-xs text-white/40">{item.condition}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-black text-lg">{item.price}</span>
                <div className="text-right">
                  <div className="text-white/60 text-xs">{item.seller}</div>
                  <div className="text-white/30 text-xs">{item.score.toLocaleString()} pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Have Something to List?</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Create your free account to list gear, post events, or offer your coaching services to the Sandlotz community.
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
