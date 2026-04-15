'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/layout/AppHeader'
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
  CheckCircle,
} from 'lucide-react'

const TABS = ['All', 'Gear', 'Events', 'Players', 'Services']

const CHALLENGES = [
  { title: "Nike's NYC Borough Battle",       timeLeft: '3 days left',  participants: '1,204', progress: 85 },
  { title: "Garmin's Global Running Day",     timeLeft: '1 day left',   participants: '8,753', progress: 92 },
  { title: "Wilson's Weekend Warrior Tennis", timeLeft: '2 days left',  participants: '450',   progress: 45 },
]

const LISTINGS = [
  { id: 1, category: 'Gear',    title: 'Wilson Evolution Basketball',   desc: 'Slightly used, great condition. The best indoor basketball money can buy.', location: 'Queens, NY',    price: '$45',    icon: 'Tag',    action: 'View Item' },
  { id: 2, category: 'Players', title: 'Alex Johnson',                  desc: 'Passionate about basketball and tennis. Always looking for new players.', location: 'Brooklyn, NY', price: null,     icon: 'Users',  action: 'Connect',   promoted: true },
  { id: 3, category: 'Gear',    title: 'Nike Air Zoom Pegasus 40',      desc: 'Size 10. Worn twice. Great for tempo runs.',                             location: 'Manhattan, NY', price: '$85',    icon: 'Tag',    action: 'View Item' },
  { id: 4, category: 'Events',  title: 'Saturday Morning Run Club',     desc: '5K easy run around Central Park. All paces welcome.',                   location: 'Central Park, NY', price: 'Free', icon: 'Calendar', action: 'Join Event' },
  { id: 5, category: 'Services',title: 'Basketball Coaching Sessions',  desc: '1-on-1 coaching for players aged 12-25. Former D3 player.',             location: 'Bronx, NY',     price: '$60/hr', icon: 'Star',   action: 'Book Now' },
  { id: 6, category: 'Gear',    title: 'Peloton Cycling Shoes',         desc: 'Size 9W, clip-in, barely used.',                                        location: 'Brooklyn, NY',  price: '$40',    icon: 'Tag',    action: 'View Item' },
]

function ListingIcon({ icon }: { icon: string }) {
  if (icon === 'Users')    return <Users    className="text-white/20 w-12 h-12" />
  if (icon === 'Calendar') return <CalendarDays className="text-white/20 w-12 h-12" />
  if (icon === 'Star')     return <Star     className="text-white/20 w-12 h-12" />
  return <Tag className="text-white/20 w-12 h-12" />
}

export default function MarketplacePage() {
  const [activeTab,    setActiveTab]    = useState('All')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [toast,        setToast]        = useState('')
  const [joinedIds,    setJoinedIds]    = useState<Set<string>>(new Set())
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const filtered = LISTINGS.filter(l => {
    const matchesTab = activeTab === 'All' || l.category === activeTab
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  return (
    <main>
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Marketplace" subtitle="Spend PlayerPoints on gear & perks" />
      </div>

      {/* ── Hero ── */}
      <section className="text-center pt-6 pb-8 px-6">
        <h1 className="text-4xl font-black text-yellow-400 mb-4">Find Your Fit</h1>

        <div className="flex justify-center mb-6">
          <Link href="/log-activity" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm">
            <PlusCircle className="w-4 h-4" />
            + Post Item
          </Link>
        </div>

        {/* Search row */}
        <form
          onSubmit={e => { e.preventDefault(); showToast('Searching...') }}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for players, items, or services..."
              className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none"
            />
          </div>
          <div className="w-40 flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              placeholder="Zip code"
              className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none"
            />
          </div>
          <button type="submit" className="btn-primary px-5 py-3 rounded-xl font-bold text-sm">
            Search
          </button>
        </form>
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
      <div className="max-w-6xl mx-auto px-6 mb-10">
        {filtered.length === 0 ? (
          <div className="sz-card p-12 text-center">
            <p className="text-white/40">No listings match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(listing => (
              <div key={listing.id} className="sz-card overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                  {listing.promoted && (
                    <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded">Promoted</span>
                  )}
                  <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">{listing.category}</span>
                </div>
                <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
                  <ListingIcon icon={listing.icon} />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-white font-bold mb-1">{listing.title}</p>
                  <p className="text-white/60 text-sm mb-2 flex-1 line-clamp-2">{listing.desc}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-white/50" />
                    <span className="text-white/50 text-xs">{listing.location}</span>
                  </div>
                  {listing.price && <p className="text-yellow-400 font-bold text-lg mb-1">{listing.price}</p>}
                  <button
                    onClick={() => showToast(`${listing.action} — full listings coming soon!`)}
                    className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {listing.action === 'View Item' && <ShoppingCart className="w-4 h-4" />}
                    {listing.action === 'Connect'   && <Users className="w-4 h-4" />}
                    {listing.action === 'Join Event' && <CalendarDays className="w-4 h-4" />}
                    {listing.action === 'Book Now'  && <Star className="w-4 h-4" />}
                    {listing.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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

        <div className="flex gap-3 justify-end mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <MapPin className="w-3.5 h-3.5 text-white/40" />
            <input type="text" placeholder="Zip code" className="bg-transparent text-white text-sm placeholder-white/40 outline-none w-24" />
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

        {CHALLENGES.map(c => {
          const key = c.title
          const joined = joinedIds.has(key)
          return (
            <div key={key} className="sz-card p-4 mb-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-white font-bold">{c.title}</p>
                <span className="text-white/50 text-sm shrink-0">{c.timeLeft}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 my-2">
                <div className="h-full rounded-full bg-yellow-400" style={{ width: `${c.progress}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                  <Users className="w-4 h-4" />
                  {c.participants} participants
                </div>
                <button
                  onClick={() => {
                    setJoinedIds(prev => { const s = new Set(prev); s.add(key); return s })
                    showToast(`Joined "${c.title}"! Full challenge tracking coming soon.`)
                  }}
                  disabled={joined}
                  className="btn-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-70"
                >
                  {joined ? <><CheckCircle className="w-3.5 h-3.5" /> Joined!</> : <><Filter className="w-3.5 h-3.5" /> Join Challenge</>}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 pointer-events-none">
          {toast}
        </div>
      )}

    </main>
  )
}
