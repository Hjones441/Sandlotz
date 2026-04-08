'use client'

import { useState } from 'react'
import {
  Search,
  MapPin,
  PlusCircle,
  Tag,
  ShoppingCart,
  Users,
  TrendingUp,
  CalendarDays,
  Star,
  Filter,
} from 'lucide-react'

const TABS = ['All', 'Gear', 'Events', 'Players', 'Services']

const CHALLENGES = [
  { title: "Nike's NYC Borough Battle",       timeLeft: '3 days left',  participants: '1,204', progress: 85 },
  { title: "Garmin's Global Running Day",     timeLeft: '1 day left',   participants: '8,753', progress: 92 },
  { title: "Wilson's Weekend Warrior Tennis", timeLeft: '2 days left',  participants: '450',   progress: 45 },
]

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="text-center pt-28 pb-10 px-6">
        <h1 className="text-5xl font-black text-yellow-400 mb-6">Find Your Fit</h1>

        {/* Post Item button */}
        <div className="flex justify-center mb-6">
          <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
            <PlusCircle className="w-4 h-4" />
            + Post Item
          </button>
        </div>

        {/* Search row */}
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              placeholder="Search for players, items, or services..."
              className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none"
            />
          </div>
          <div className="w-48 flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              placeholder="Enter zip code..."
              className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none w-full"
            />
          </div>
          <button className="btn-primary px-5 py-3 rounded-xl font-bold text-sm">
            Search
          </button>
        </div>
      </section>

      {/* ── Map banner ── */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl w-full h-48 flex items-center justify-center relative">
          <span className="text-white/20 text-lg">📍 Map View Coming Soon</span>
          <div className="absolute top-3 left-3 bg-purple-900 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            New York, NY
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-2 text-sm transition-all font-medium ${
                activeTab === tab
                  ? 'bg-yellow-400 text-purple-900 font-bold'
                  : 'text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listings grid ── */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">

        {/* 1. Gear: Wilson Basketball */}
        <div className="sz-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">Gear</span>
          </div>
          <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
            <Tag className="text-white/20 w-12 h-12" />
          </div>
          <div className="p-4">
            <p className="text-white font-bold mb-1">Wilson Evolution Basketball</p>
            <p className="text-white/60 text-sm mb-2">Slightly used, great condition. The best indoor basketball money can buy.</p>
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-white/50 text-xs">Queens, NY</span>
            </div>
            <p className="text-yellow-400 font-bold text-lg mb-1">$45</p>
            <button className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              View Item
            </button>
          </div>
        </div>

        {/* 2. Player: Alex Johnson (Promoted) */}
        <div className="sz-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded">Promoted</span>
            <span className="bg-white/10 text-xs px-2 py-0.5 rounded text-white/70">Player</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">AJ</div>
            <div>
              <p className="font-bold text-white">Alex Johnson</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white/50" />
                <span className="text-white/50 text-xs">Brooklyn, NY</span>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-3 line-clamp-2">Passionate about basketball and tennis. Always looking for new players to practice and compete with.</p>
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">Basketball · Intermediate</span>
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">Tennis · Beginner</span>
          </div>
          <button className="btn-primary w-full rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Connect
          </button>
        </div>

        {/* 3. Gear: Nike Pegasus */}
        <div className="sz-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">Gear</span>
          </div>
          <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
            <Tag className="text-white/20 w-12 h-12" />
          </div>
          <div className="p-4">
            <p className="text-white font-bold mb-1">Nike Air Zoom Pegasus 40</p>
            <p className="text-white/60 text-sm mb-2">Size 10. Worn twice. Great for tempo runs.</p>
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-white/50 text-xs">Manhattan, NY</span>
            </div>
            <p className="text-yellow-400 font-bold text-lg mb-1">$85</p>
            <button className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              View Item
            </button>
          </div>
        </div>

        {/* 4. Event: Saturday Run Club */}
        <div className="sz-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">Event</span>
          </div>
          <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
            <CalendarDays className="text-white/20 w-12 h-12" />
          </div>
          <div className="p-4">
            <p className="text-white font-bold mb-1">Saturday Morning Run Club</p>
            <p className="text-white/60 text-sm mb-2">5K easy run around Central Park. All paces welcome.</p>
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-white/50 text-xs">Central Park, NY</span>
            </div>
            <p className="text-yellow-400 font-bold text-lg mb-1">Free</p>
            <button className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Join Event
            </button>
          </div>
        </div>

        {/* 5. Service: Basketball Coaching */}
        <div className="sz-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">Service</span>
          </div>
          <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
            <Star className="text-white/20 w-12 h-12" />
          </div>
          <div className="p-4">
            <p className="text-white font-bold mb-1">Basketball Coaching Sessions</p>
            <p className="text-white/60 text-sm mb-2">1-on-1 coaching for players aged 12-25. Former D3 player.</p>
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-white/50 text-xs">Bronx, NY</span>
            </div>
            <p className="text-yellow-400 font-bold text-lg mb-1">$60/hr</p>
            <button className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Book Now
            </button>
          </div>
        </div>

        {/* 6. Gear: Peloton Cycling Shoes */}
        <div className="sz-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">Gear</span>
          </div>
          <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
            <Tag className="text-white/20 w-12 h-12" />
          </div>
          <div className="p-4">
            <p className="text-white font-bold mb-1">Peloton Cycling Shoes</p>
            <p className="text-white/60 text-sm mb-2">Size 9W, clip-in, barely used.</p>
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-white/50 text-xs">Brooklyn, NY</span>
            </div>
            <p className="text-yellow-400 font-bold text-lg mb-1">$40</p>
            <button className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              View Item
            </button>
          </div>
        </div>

      </div>

      {/* ── Sponsored Challenges ── */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Sponsored Challenges</h2>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Join brand-sponsored challenges to compete for glory and bonus PlayerPoints.
        </p>

        {/* Filter row */}
        <div className="flex gap-3 justify-end mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Zip code"
              className="bg-transparent text-white text-sm placeholder-white/40 outline-none w-24"
            />
          </div>
          <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
            <option value="">All Sports</option>
            <option value="basketball">Basketball</option>
            <option value="running">Running</option>
            <option value="tennis">Tennis</option>
          </select>
          <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="ending">Ending Soon</option>
          </select>
        </div>

        {/* Challenge rows */}
        {CHALLENGES.map(c => (
          <div key={c.title} className="sz-card p-4 mb-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-white font-bold">{c.title}</p>
              <span className="text-white/50 text-sm shrink-0">{c.timeLeft}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 my-2">
              <div
                className="h-full rounded-full bg-yellow-400"
                style={{ width: `${c.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Users className="w-4 h-4" />
                {c.participants} participants
              </div>
              <button className="btn-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Join Challenge
              </button>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
