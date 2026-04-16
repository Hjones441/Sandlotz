'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/layout/AppHeader'
import { useAuth } from '@/context/AuthContext'
import { getListings, createListing } from '@/lib/firestore'
import type { Listing } from '@/lib/firestore'
import { SPORT_OPTIONS } from '@/lib/sandlotzScore'
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
  X,
  Loader2,
} from 'lucide-react'

const TABS = ['All', 'Gear', 'Events', 'Players', 'Services'] as const
type TabType = typeof TABS[number]

const CHALLENGES = [
  { title: "Nike's NYC Borough Battle",       timeLeft: '3 days left',  participants: '1,204', progress: 85 },
  { title: "Garmin's Global Running Day",     timeLeft: '1 day left',   participants: '8,753', progress: 92 },
  { title: "Wilson's Weekend Warrior Tennis", timeLeft: '2 days left',  participants: '450',   progress: 45 },
]

function CategoryIcon({ category }: { category: string }) {
  if (category === 'Players')  return <Users       className="text-white/20 w-12 h-12" />
  if (category === 'Events')   return <CalendarDays className="text-white/20 w-12 h-12" />
  if (category === 'Services') return <Star        className="text-white/20 w-12 h-12" />
  return <Tag className="text-white/20 w-12 h-12" />
}

function actionLabel(category: string) {
  if (category === 'Players')  return 'Connect'
  if (category === 'Events')   return 'Join Event'
  if (category === 'Services') return 'Book Now'
  return 'View Item'
}

function ActionIcon({ category }: { category: string }) {
  if (category === 'Players')  return <Users        className="w-4 h-4" />
  if (category === 'Events')   return <CalendarDays className="w-4 h-4" />
  if (category === 'Services') return <Star         className="w-4 h-4" />
  return <ShoppingCart className="w-4 h-4" />
}

// ─── Create Listing Modal ─────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void
  onCreated: (listing: Listing) => void
  uid: string
  displayName: string
  city: string
}

function CreateModal({ onClose, onCreated, uid, displayName, city }: CreateModalProps) {
  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [category, setCategory] = useState<Listing['category']>('Gear')
  const [price,    setPrice]    = useState('')
  const [location, setLocation] = useState(city)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !desc.trim() || !location.trim()) {
      setError('Title, description, and location are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const id = await createListing({
        uid,
        displayName,
        title:    title.trim(),
        desc:     desc.trim(),
        category,
        price:    price.trim() || null,
        location: location.trim(),
        active:   true,
      })
      onCreated({ id, uid, displayName, title: title.trim(), desc: desc.trim(), category, price: price.trim() || null, location: location.trim(), active: true, createdAt: null as any })
    } catch {
      setError('Failed to post listing. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1a1040] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-white">Post a Listing</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Category</label>
            <div className="flex gap-2 flex-wrap">
              {(['Gear', 'Events', 'Players', 'Services'] as Listing['category'][]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                    category === cat
                      ? 'bg-yellow-400 text-purple-900 border-yellow-400'
                      : 'border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Wilson Basketball — like new"
              maxLength={80}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50"
            />
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Describe the item, event, or service…"
              rows={3}
              maxLength={400}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Price <span className="normal-case text-white/30">(optional)</span></label>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. $45 or Free"
                maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City or neighborhood"
                maxLength={60}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3 rounded-xl">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { user, profile } = useAuth()
  const [activeTab,   setActiveTab]   = useState<TabType>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings,    setListings]    = useState<Listing[]>([])
  const [fetching,    setFetching]    = useState(true)
  const [showModal,   setShowModal]   = useState(false)
  const [toast,       setToast]       = useState('')
  const [joinedIds,   setJoinedIds]   = useState<Set<string>>(new Set())
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    setFetching(true)
    getListings(activeTab === 'All' ? undefined : activeTab)
      .then(data => { setListings(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [activeTab])

  const filtered = listings.filter(l => {
    const q = searchQuery.toLowerCase()
    return !q || l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
  })

  function handleCreated(listing: Listing) {
    setListings(prev => [listing, ...prev])
    setShowModal(false)
    showToast('Listing posted!')
  }

  return (
    <main>
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Marketplace" subtitle="Find gear, players, events & services" />
      </div>

      {/* ── Hero ── */}
      <section className="text-center pt-6 pb-8 px-6">
        <h1 className="text-4xl font-black text-yellow-400 mb-4">Find Your Fit</h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => user ? setShowModal(true) : showToast('Sign in to post a listing')}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            + Post Item
          </button>
        </div>

        <form
          onSubmit={e => { e.preventDefault() }}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search listings…"
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
            {profile?.city ?? 'Your City'}
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
        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="sz-card p-12 text-center">
            <p className="text-white/40 text-lg mb-2">No listings yet</p>
            <p className="text-white/30 text-sm mb-6">Be the first to post in this category.</p>
            <button
              onClick={() => user ? setShowModal(true) : showToast('Sign in to post a listing')}
              className="btn-primary px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((listing, idx) => (
              <div key={listing.id ?? idx} className="sz-card overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                  <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">{listing.category}</span>
                </div>
                <div className="bg-white/10 w-full aspect-video flex items-center justify-center">
                  <CategoryIcon category={listing.category} />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-white font-bold mb-1">{listing.title}</p>
                  <p className="text-white/60 text-sm mb-2 flex-1 line-clamp-2">{listing.desc}</p>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-white/50" />
                    <span className="text-white/50 text-xs">{listing.location}</span>
                  </div>
                  <p className="text-white/40 text-xs mb-2">Posted by {listing.displayName}</p>
                  {listing.price && <p className="text-yellow-400 font-bold text-lg mb-1">{listing.price}</p>}
                  <button
                    onClick={() => showToast(`${actionLabel(listing.category)} — contact feature coming soon!`)}
                    className="btn-primary w-full mt-3 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <ActionIcon category={listing.category} />
                    {actionLabel(listing.category)}
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

        {CHALLENGES.map(c => {
          const key    = c.title
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
                  {joined
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Joined!</>
                    : <><Filter className="w-3.5 h-3.5" /> Join Challenge</>
                  }
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && user && profile && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
          uid={user.uid}
          displayName={profile.displayName}
          city={profile.city}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </main>
  )
}
