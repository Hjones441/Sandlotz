'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/layout/AppHeader'
import { useAuth } from '@/context/AuthContext'
import { getListings, createListing } from '@/lib/firestore'
import type { Listing } from '@/lib/firestore'
import {
  Search, MapPin, PlusCircle, Tag, ShoppingCart, Users,
  CalendarDays, Star, CheckCircle, X, Loader2, TrendingUp, Filter,
} from 'lucide-react'

const TABS = ['All', 'Gear', 'Events', 'Players', 'Services'] as const
type TabType = typeof TABS[number]

const CHALLENGES = [
  { id: '1', title: "Nike's NYC Borough Battle",       days: 3, participants: 1204,  progress: 85 },
  { id: '2', title: "Garmin's Global Running Day",     days: 1, participants: 8753,  progress: 92 },
  { id: '3', title: "Wilson's Weekend Warrior Tennis", days: 2, participants: 450,   progress: 45 },
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Players:  <Users        className="text-white/20 w-12 h-12" />,
  Events:   <CalendarDays className="text-white/20 w-12 h-12" />,
  Services: <Star         className="text-white/20 w-12 h-12" />,
  Gear:     <Tag          className="text-white/20 w-12 h-12" />,
}

function actionLabel(category: string) {
  if (category === 'Players')  return 'Connect'
  if (category === 'Events')   return 'Join Event'
  if (category === 'Services') return 'Book Now'
  return 'View Item'
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
        uid, displayName,
        title:    title.trim(),
        desc:     desc.trim(),
        category,
        price:    price.trim() || null,
        location: location.trim(),
        active:   true,
      })
      onCreated({
        id, uid, displayName,
        title: title.trim(), desc: desc.trim(), category,
        price: price.trim() || null, location: location.trim(), active: true,
        createdAt: null as any,
      })
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
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {(['Gear', 'Events', 'Players', 'Services'] as Listing['category'][]).map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                    category === cat ? 'bg-yellow-400 text-purple-900 border-yellow-400' : 'border-white/10 text-white/60 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Wilson Basketball — like new" maxLength={80}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50" />
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Describe the item, event, or service…" rows={3} maxLength={400}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">
                Price <span className="normal-case text-white/30">(optional)</span>
              </label>
              <input value={price} onChange={e => setPrice(e.target.value)}
                placeholder="e.g. $45 or Free" maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50" />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="City or neighborhood" maxLength={60}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3 rounded-xl">Cancel</button>
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
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
  const [zipCode,     setZipCode]     = useState('')
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
    const z = zipCode.toLowerCase()
    const matchQ = !q || l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
    const matchZ = !z || l.location.toLowerCase().includes(z)
    return matchQ && matchZ
  })

  function handleCreated(listing: Listing) {
    setListings(prev => [listing, ...prev])
    setShowModal(false)
    showToast('Listing posted!')
  }

  return (
    <main className="min-h-screen bg-[#0e0825]">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Marketplace" subtitle="Find gear, players, events & services" />
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#7C3AED] to-[#6D28D9] px-4 pt-8 pb-8 text-center">
        <h1 className="text-4xl font-black text-yellow-400 mb-5">Find Your Fit</h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => user ? setShowModal(true) : showToast('Sign in to post a listing')}
            className="bg-yellow-400 text-purple-900 font-black text-sm px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            + Post Item
          </button>
        </div>

        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for players, items, or services"
              className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 w-40">
            <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
            <input
              type="text"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              placeholder="Enter zip code..."
              className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none w-0 min-w-0"
            />
          </div>
          <button
            onClick={() => showToast(filtered.length + ' results found')}
            className="bg-yellow-400 text-purple-900 font-black text-sm px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors shrink-0">
            Search
          </button>
        </div>
      </section>

      {/* ── Map banner ──────────────────────────────────────────────────────── */}
      <section className="bg-[#6D28D9] px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '200px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-sm">Local Map View Coming Soon</p>
              </div>
            </div>
            <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              {profile?.city ?? 'Your City'}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

        {/* ── Category Tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-2 text-sm transition-all font-medium ${
                activeTab === tab ? 'bg-yellow-400 text-purple-900 font-bold' : 'text-white/60 hover:text-white border border-white/10'
              }`}>
              {tab}
            </button>
          ))}
          {(searchQuery || zipCode) && (
            <button onClick={() => { setSearchQuery(''); setZipCode('') }}
              className="rounded-xl px-4 py-2 text-xs text-white/40 border border-white/10 hover:border-white/20 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Listings Grid ──────────────────────────────────────────────────── */}
        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="sz-card p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-lg mb-2">No listings found</p>
            <p className="text-white/30 text-sm mb-6">
              {searchQuery || zipCode ? 'Try different search terms or clear filters.' : 'Be the first to post in this category.'}
            </p>
            <button
              onClick={() => user ? setShowModal(true) : showToast('Sign in to post a listing')}
              className="bg-yellow-400 text-purple-900 font-bold text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Post a Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((listing, idx) => (
              <div key={listing.id ?? idx} className="sz-card overflow-hidden flex flex-col">
                <div className="bg-white/10 w-full aspect-video flex items-center justify-center relative">
                  {CATEGORY_ICONS[listing.category] ?? <Tag className="text-white/20 w-12 h-12" />}
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/10 backdrop-blur text-white/70 text-xs px-2 py-0.5 rounded-full border border-white/10">
                      {listing.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-white font-bold mb-1">{listing.title}</p>
                  <p className="text-white/60 text-sm mb-3 flex-1 line-clamp-2">{listing.desc}</p>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-white/40" />
                    <span className="text-white/40 text-xs">{listing.location}</span>
                  </div>
                  <p className="text-white/30 text-xs mb-3">Posted by {listing.displayName}</p>
                  {listing.price && <p className="text-yellow-400 font-black text-lg mb-2">{listing.price}</p>}
                  <button
                    onClick={() => showToast(`${actionLabel(listing.category)} — contact feature coming soon!`)}
                    className="bg-yellow-400 text-purple-900 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors w-full">
                    {actionLabel(listing.category)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Sponsored Challenges ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-black text-white">Sponsored Challenges</h2>
              </div>
              <p className="text-white/50 text-sm">Join brand-sponsored challenges to compete for glory and bonus PlayerPoints.</p>
            </div>
            <Link href="/leaderboard" className="text-yellow-400/70 hover:text-yellow-400 text-xs font-bold transition-colors shrink-0 mt-1">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {CHALLENGES.map(c => {
              const joined = joinedIds.has(c.id)
              return (
                <div key={c.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-white font-bold">{c.title}</p>
                    <span className="text-white/50 text-xs shrink-0">{c.days} {c.days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 mb-3">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Users className="w-4 h-4" />
                      {c.participants.toLocaleString()} Participants
                    </div>
                    <button
                      onClick={() => {
                        if (!joined) {
                          setJoinedIds(prev => { const s = new Set(prev); s.add(c.id); return s })
                          showToast(`Joined "${c.title}"! Full tracking coming soon.`)
                        }
                      }}
                      disabled={joined}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                        joined ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                          : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300'
                      }`}>
                      {joined
                        ? <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Joined</span>
                        : 'Join Challenge'
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
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
