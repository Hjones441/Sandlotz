'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AppHeader from '@/components/layout/AppHeader'
import { useAuth } from '@/context/AuthContext'
import { getListings, createListing, getUserActivities, redeemPerk } from '@/lib/firestore'
import { getRankTier } from '@/lib/sandlotzScore'
import type { Listing, Activity } from '@/lib/firestore'
import {
  Search, MapPin, PlusCircle, Tag, ShoppingCart, Users,
  CalendarDays, Star, CheckCircle, X, Loader2, TrendingUp,
  Gift, Zap, Trophy, Clock, Lock, AlertCircle,
  ExternalLink, Shield,
} from 'lucide-react'

type MainTab = 'browse' | 'perks'
type BrowseTab = 'All' | 'Gear' | 'Events' | 'Players' | 'Services'
const BROWSE_TABS: BrowseTab[] = ['All', 'Gear', 'Events', 'Players', 'Services']

const CHALLENGES = [
  { id: '1', title: "Nike's NYC Borough Battle",       days: 3, participants: 1204, progress: 85 },
  { id: '2', title: "Garmin's Global Running Day",     days: 1, participants: 8753, progress: 92 },
  { id: '3', title: "Wilson's Weekend Warrior Tennis", days: 2, participants: 450,  progress: 45 },
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

const TIER_REQ: Record<string, number> = { '6': 2, '8': 2, '4': 1 }
const PERK_CATEGORIES = ['All', 'Gear', 'Events', 'Services', 'Digital', 'Premium']
const TIER_LABELS = ['Rookie', 'Athlete', 'Pro', 'Elite', 'Legend']

const PERKS = [
  { id:'1', title:'20% Off Nike Gear',       cost:500,  brand:'Nike',        category:'Gear',     emoji:'👟', desc:'Discount code for Nike.com. Valid on full-price items. Expires 30 days after redemption.',  sponsored:true,  available:true },
  { id:'2', title:'Free Protein Shake',       cost:200,  brand:'GNC',         category:'Services', emoji:'💪', desc:'Redeemable at any GNC location. One per account. Present app on pickup.',                   sponsored:true,  available:true },
  { id:'3', title:'Columbus FC Tickets',      cost:1000, brand:'Columbus FC', category:'Events',   emoji:'⚽', desc:'2 tickets to a home match. Seat selection subject to availability.',                        sponsored:true,  available:true },
  { id:'4', title:'Fitness Assessment',       cost:750,  brand:'FitLab',      category:'Services', emoji:'📊', desc:'Full performance analysis — VO2 max, body composition, movement screening.',               sponsored:false, available:true },
  { id:'5', title:'$25 SportChek Credit',     cost:300,  brand:'SportChek',   category:'Digital',  emoji:'🏬', desc:'In-store or online credit. No minimum purchase required.',                                  sponsored:false, available:true },
  { id:'6', title:'Sandlotz Pro — 1 Month',   cost:400,  brand:'Sandlotz',    category:'Premium',  emoji:'⭐', desc:'Advanced analytics, listing boosts, early challenge access, exclusive badges.',             sponsored:false, available:true },
  { id:'7', title:'Garmin Watch Raffle',      cost:150,  brand:'Garmin',      category:'Gear',     emoji:'⌚', desc:'Enter to win a Garmin Forerunner 265. Drawing every Friday.',                              sponsored:true,  available:true, flash:true, flashEnds:'2h 14m' },
  { id:'8', title:'1-on-1 Coaching Session',  cost:600,  brand:'CoachHub',    category:'Services', emoji:'🏀', desc:'60-min personalized coaching with a certified trainer. Book within 7 days.',                sponsored:false, available:true },
]

const DISCLAIMER_PARAGRAPHS = [
  'PlayerPoints are non-transferable, promotional loyalty points issued by Sandlotz for participation and engagement within the platform. PlayerPoints hold no cash or monetary value and cannot be redeemed for cash, credit, or gift cards. Sandlotz reserves the right to modify, revoke, devalue, or expire points at any time, with or without notice, and at its sole discretion.',
  'Perks, discounts, or items available in the Perks Store are subject to availability and may change at any time. Sandlotz makes no warranties regarding third-party offers or items redeemed via the Perks Store.',
  'Users are prohibited from attempting to sell, trade, or exchange PlayerPoints for any consideration outside of Sandlotz. Any such attempt is a violation of our Terms of Service and may result in account suspension or termination. All redeemed perks are tied to your Sandlotz account and are strictly non-transferable.',
]

function getTierIndex(score: number): number {
  if (score >= 10000) return 4
  if (score >= 5000)  return 3
  if (score >= 2000)  return 2
  if (score >= 500)   return 1
  return 0
}

interface CreateModalProps { onClose: () => void; onCreated: (l: Listing) => void; uid: string; displayName: string; city: string }

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
    if (!title.trim() || !desc.trim() || !location.trim()) { setError('Title, description, and location are required.'); return }
    setSaving(true); setError('')
    try {
      const id = await createListing({ uid, displayName, title: title.trim(), desc: desc.trim(), category, price: price.trim() || null, location: location.trim(), active: true })
      onCreated({ id, uid, displayName, title: title.trim(), desc: desc.trim(), category, price: price.trim() || null, location: location.trim(), active: true, createdAt: null as any })
    } catch { setError('Failed to post listing. Please try again.'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1a1040] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-white">Post a Listing</h2>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {(['Gear', 'Events', 'Players', 'Services'] as Listing['category'][]).map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border ${category === cat ? 'bg-yellow-400 text-purple-900 border-yellow-400' : 'border-white/10 text-white/60 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Wilson Basketball — like new" maxLength={80}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the item, event, or service…" rows={3} maxLength={400}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Price <span className="normal-case text-white/30">(optional)</span></label>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. $45 or Free" maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50" />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or neighborhood" maxLength={60}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50" />
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

interface RedeemModalProps { perk: typeof PERKS[0]; onClose: () => void; onConfirm: () => Promise<void> }

function RedeemModal({ perk, onClose, onConfirm }: RedeemModalProps) {
  const [confirming, setConfirming] = useState(false)
  const [done,       setDone]       = useState(false)

  async function handleConfirm() {
    setConfirming(true)
    await onConfirm()
    setDone(true)
    setConfirming(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-md bg-[#1a1040] border border-white/10 rounded-2xl p-6 shadow-2xl">
        {done ? (
          <div className="text-center py-4">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-black text-white mb-2">Perk Redeemed!</h3>
            <p className="text-white/60 text-sm mb-1">{perk.title}</p>
            <p className="text-white/40 text-xs mb-6">Check your email for redemption details from {perk.brand}.</p>
            <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl font-bold">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-white">Confirm Redemption</h3>
              <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{perk.emoji}</span>
                <div><p className="font-bold text-white">{perk.title}</p><p className="text-white/50 text-xs">{perk.brand}</p></div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{perk.desc}</p>
            </div>
            <div className="flex items-center justify-between mb-5 bg-yellow-400/10 rounded-xl p-3">
              <span className="text-white/70 text-sm">Points deducted</span>
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400 font-black">{perk.cost.toLocaleString()} PP</span></div>
            </div>
            <p className="text-white/30 text-xs mb-5">This action is final. Points cannot be refunded after redemption.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1 py-3 rounded-xl">Cancel</button>
              <button onClick={handleConfirm} disabled={confirming} className="btn-primary flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {confirming ? <><Loader2 className="w-4 h-4 animate-spin" /> Redeeming…</> : <><Gift className="w-4 h-4" /> Redeem</>}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function MarketplacePage() {
  const { user, profile } = useAuth()
  const [mainTab,       setMainTab]       = useState<MainTab>('browse')
  const [browseTab,     setBrowseTab]     = useState<BrowseTab>('All')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [zipCode,       setZipCode]       = useState('')
  const [listings,      setListings]      = useState<Listing[]>([])
  const [fetching,      setFetching]      = useState(true)
  const [showModal,     setShowModal]     = useState(false)
  const [joinedIds,     setJoinedIds]     = useState<Set<string>>(new Set())
  const [perkCategory,  setPerkCategory]  = useState('All')
  const [activities,    setActivities]    = useState<Activity[]>([])
  const [redeemingPerk, setRedeemingPerk] = useState<typeof PERKS[0] | null>(null)
  const [redeemedIds,   setRedeemedIds]   = useState<Set<string>>(new Set())
  const [toast,         setToast]         = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    setFetching(true)
    getListings(browseTab === 'All' ? undefined : browseTab)
      .then(data => { setListings(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [browseTab])

  useEffect(() => {
    if (!user || mainTab !== 'perks') return
    getUserActivities(user.uid).then(setActivities).catch(() => {})
  }, [user, mainTab])

  const filtered = listings.filter(l => {
    const q = searchQuery.toLowerCase(), z = zipCode.toLowerCase()
    return (!q || l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.location.toLowerCase().includes(q))
        && (!z || l.location.toLowerCase().includes(z))
  })

  const balance      = profile?.totalScore ?? 0
  const tierIndex    = getTierIndex(balance)
  const tier         = getRankTier(balance)
  const filteredPerks = PERKS.filter(p => perkCategory === 'All' || p.category === perkCategory)

  const monthlyEarned = useMemo(() => {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
    return activities.filter(a => new Date((a.createdAt as any).seconds * 1000) >= start).reduce((s, a) => s + a.score, 0)
  }, [activities])

  async function handleRedeem(perk: typeof PERKS[0]) {
    if (!user) return
    await redeemPerk(user.uid, perk.id, perk.title, perk.cost)
    setRedeemedIds(prev => { const s = new Set(prev); s.add(perk.id); return s })
  }

  return (
    <main className="min-h-screen bg-[#0e0825]">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Marketplace" subtitle="Gear, players, events & rewards" />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#7C3AED] to-[#6D28D9] px-4 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-black text-yellow-400 mb-4">Find Your Fit</h1>
        <div className="inline-flex bg-black/20 border border-white/10 rounded-2xl p-1 mb-5">
          <button onClick={() => setMainTab('browse')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mainTab === 'browse' ? 'bg-yellow-400 text-purple-900' : 'text-white/60 hover:text-white'}`}>
            Browse Market
          </button>
          <button onClick={() => setMainTab('perks')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${mainTab === 'perks' ? 'bg-yellow-400 text-purple-900' : 'text-white/60 hover:text-white'}`}>
            <Gift className="w-4 h-4" /> Perks &amp; Rewards
          </button>
        </div>

        {mainTab === 'browse' && (
          <>
            <div className="flex justify-center mb-5">
              <button onClick={() => user ? setShowModal(true) : showToast('Sign in to post a listing')}
                className="bg-yellow-400 text-purple-900 font-black text-sm px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> + Post Item
              </button>
            </div>
            <div className="max-w-2xl mx-auto flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <Search className="w-4 h-4 text-white/50 shrink-0" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search players, items, or services"
                  className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 w-36">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="Zip code"
                  className="bg-transparent flex-1 text-white placeholder-white/40 text-sm outline-none w-0 min-w-0" />
              </div>
              <button onClick={() => showToast(filtered.length + ' results found')}
                className="bg-yellow-400 text-purple-900 font-black text-sm px-5 py-3 rounded-xl hover:bg-yellow-300 transition-colors shrink-0">
                Search
              </button>
            </div>
          </>
        )}
        {mainTab === 'perks' && (
          <p className="text-white/70 text-sm max-w-md mx-auto">Earn PlayerPoints by training hard. Spend them on real rewards from brand partners.</p>
        )}
      </section>

      {/* BROWSE */}
      {mainTab === 'browse' && (
        <>
          <section className="bg-[#6D28D9] px-4 pb-4">
            <div className="max-w-6xl mx-auto">
              <div className="relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '180px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="w-10 h-10 text-white/10 mx-auto mb-2" />
                    <p className="text-white/20 text-sm">Local Map View Coming Soon</p>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />{profile?.city ?? 'Your City'}
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
            <div className="flex gap-2 flex-wrap">
              {BROWSE_TABS.map(tab => (
                <button key={tab} onClick={() => setBrowseTab(tab)}
                  className={`rounded-xl px-5 py-2 text-sm transition-all font-medium ${browseTab === tab ? 'bg-yellow-400 text-purple-900 font-bold' : 'text-white/60 hover:text-white border border-white/10'}`}>
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

            {fetching ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="sz-card p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-lg mb-2">No listings yet</p>
                <p className="text-white/30 text-sm mb-6">{searchQuery || zipCode ? 'Try different search terms or clear filters.' : 'Be the first to post in this category.'}</p>
                <button onClick={() => user ? setShowModal(true) : showToast('Sign in to post a listing')}
                  className="bg-yellow-400 text-purple-900 font-bold text-sm px-6 py-3 rounded-xl inline-flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Post a Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((listing, idx) => (
                  <div key={listing.id ?? idx} className="sz-card overflow-hidden flex flex-col">
                    <div className="bg-white/10 w-full aspect-video flex items-center justify-center relative">
                      {CATEGORY_ICONS[listing.category] ?? <Tag className="text-white/20 w-12 h-12" />}
                      <div className="absolute top-2 left-2">
                        <span className="bg-white/10 backdrop-blur text-white/70 text-xs px-2 py-0.5 rounded-full border border-white/10">{listing.category}</span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-white font-bold mb-1">{listing.title}</p>
                      <p className="text-white/60 text-sm mb-3 flex-1 line-clamp-2">{listing.desc}</p>
                      <div className="flex items-center gap-1 mb-1"><MapPin className="w-3 h-3 text-white/40" /><span className="text-white/40 text-xs">{listing.location}</span></div>
                      <p className="text-white/30 text-xs mb-3">Posted by {listing.displayName}</p>
                      {listing.price && <p className="text-yellow-400 font-black text-lg mb-2">{listing.price}</p>}
                      <button onClick={() => showToast(`${actionLabel(listing.category)} — contact feature coming soon!`)}
                        className="bg-yellow-400 text-purple-900 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors w-full">
                        {actionLabel(listing.category)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <section>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-black text-white">Sponsored Challenges</h2>
                  </div>
                  <p className="text-white/50 text-sm">Join brand challenges to compete for glory and bonus PlayerPoints.</p>
                </div>
                <Link href="/leaderboard" className="text-yellow-400/70 hover:text-yellow-400 text-xs font-bold transition-colors shrink-0 mt-1">View All →</Link>
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
                      <div className="h-2 rounded-full bg-white/10 mb-3"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${c.progress}%` }} /></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/60 text-sm"><Users className="w-4 h-4" />{c.participants.toLocaleString()} Participants</div>
                        <button
                          onClick={() => { if (!joined) { setJoinedIds(prev => { const s = new Set(prev); s.add(c.id); return s }); showToast(`Joined "${c.title}"! Full tracking coming soon.`) } }}
                          disabled={joined}
                          className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${joined ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default' : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300'}`}>
                          {joined ? <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Joined</span> : 'Join Challenge'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </>
      )}

      {/* PERKS */}
      {mainTab === 'perks' && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="sz-card p-5">
              <div className="flex items-center gap-2 mb-2"><Zap className="w-5 h-5 text-yellow-400" /><span className="text-white font-bold text-sm">Your Balance</span></div>
              <p className="text-4xl font-black text-yellow-400 leading-none mb-1">{balance.toLocaleString()}</p>
              <p className="text-white/40 text-xs mb-3">PlayerPoints available</p>
              <Link href="/log-activity" className="text-yellow-400 hover:text-yellow-300 text-xs font-bold transition-colors">+ Earn more points →</Link>
            </div>
            <div className="sz-card p-5">
              <div className="flex items-center gap-2 mb-2"><Trophy className="w-5 h-5 text-yellow-400" /><span className="text-white font-bold text-sm">Your Tier</span></div>
              <div className="flex items-center gap-2 mb-3"><span className={`text-sm font-black px-3 py-1 rounded-full border ${tier.badgeClass}`}>{tier.label}</span></div>
              <div className="space-y-1">
                {TIER_LABELS.map((t, i) => (
                  <div key={t} className={`flex items-center gap-2 text-xs ${i <= tierIndex ? 'text-yellow-400' : 'text-white/20'}`}>
                    {i < tierIndex ? <CheckCircle className="w-3 h-3" /> : i === tierIndex ? <Star className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-30" />}
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="sz-card p-5 border-yellow-400/20 bg-yellow-400/5">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-yellow-400" /><span className="text-white font-bold text-sm">This Month</span></div>
              <p className="text-2xl font-black text-white mb-1">{monthlyEarned.toLocaleString()} <span className="text-sm text-white/40 font-normal">/ 2,000</span></p>
              <div className="h-1.5 bg-white/10 rounded-full mb-2"><div className="h-1.5 bg-yellow-400 rounded-full transition-all" style={{ width: `${Math.min(100, (monthlyEarned / 2000) * 100)}%` }} /></div>
              <p className="text-white/30 text-xs">Points earned from activities</p>
            </div>
          </div>

          {tierIndex < 2 && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-6 flex items-center gap-4">
              <Shield className="w-8 h-8 text-yellow-400/50 shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">Unlock Pro Tier Perks</p>
                <p className="text-white/40 text-xs">Reach <span className="text-yellow-400 font-bold">Pro tier (2,000 PP)</span> to unlock coaching sessions, assessments, and premium rewards.</p>
              </div>
              <Link href="/log-activity" className="btn-primary text-xs !py-2 !px-4 shrink-0">Train Now</Link>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mb-6">
            {PERK_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setPerkCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${perkCategory === cat ? 'bg-yellow-400 text-purple-900 font-bold' : 'text-white/60 hover:text-white border border-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {filteredPerks.map(perk => {
              const canAfford  = balance >= perk.cost
              const reqTier    = TIER_REQ[perk.id]
              const tierLocked = reqTier !== undefined && tierIndex < reqTier
              const isRedeemed = redeemedIds.has(perk.id)
              const canRedeem  = perk.available && canAfford && !tierLocked && !isRedeemed
              return (
                <motion.div key={perk.id} layout className={`sz-card overflow-hidden flex flex-col ${tierLocked ? 'opacity-50' : ''}`}>
                  {perk.flash && (
                    <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-4 py-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" /><span className="text-yellow-400 text-xs font-bold">Flash Auction ends in {perk.flashEnds}</span>
                    </div>
                  )}
                  <div className="bg-white/10 aspect-video flex items-center justify-center relative">
                    <span className="text-5xl">{perk.emoji}</span>
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {perk.sponsored && <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">Sponsored</span>}
                      {tierLocked && <span className="bg-purple-900/80 text-white/60 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10"><Lock className="w-3 h-3" /> {TIER_LABELS[reqTier!]}+</span>}
                      {isRedeemed && <span className="bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Redeemed</span>}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-white/40 mb-1">{perk.brand} · {perk.category}</p>
                    <p className="text-white font-bold mb-1">{perk.title}</p>
                    <p className="text-white/60 text-sm mb-4 flex-1 leading-relaxed">{perk.desc}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400 font-black">{perk.cost.toLocaleString()}</span><span className="text-white/40 text-xs">pts</span></div>
                      {!canAfford && !tierLocked && !isRedeemed && <span className="text-white/40 text-xs">Need {(perk.cost - balance).toLocaleString()} more</span>}
                      {tierLocked && <span className="text-white/30 text-xs">Requires {TIER_LABELS[reqTier!]}</span>}
                    </div>
                    <button onClick={() => canRedeem && setRedeemingPerk(perk)} disabled={!canRedeem}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      {isRedeemed ? <><CheckCircle className="w-4 h-4" /> Redeemed</>
                        : tierLocked ? <><Lock className="w-4 h-4" /> Unlock at {TIER_LABELS[reqTier!]}</>
                        : !canAfford ? <><Zap className="w-4 h-4" /> Not Enough Points</>
                        : perk.flash ? <><Clock className="w-4 h-4" /> Place Bid</>
                        : <><Gift className="w-4 h-4" /> Redeem Now</>}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="sz-card p-6 flex flex-col sm:flex-row items-center gap-5 mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><Trophy className="w-5 h-5 text-yellow-400" /><span className="font-bold text-white">Want More Points?</span></div>
              <p className="text-white/60 text-sm">Log activities, complete quests, and join sponsored challenges to stack PlayerPoints fast.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/log-activity" className="btn-primary text-sm !py-2 !px-4 flex items-center gap-2"><Zap className="w-4 h-4" /> Log Activity</Link>
              <Link href="/leaderboard" className="btn-ghost text-sm !py-2 !px-4 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Leaderboard</Link>
            </div>
          </div>

          <div className="sz-card p-6">
            <div className="flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4 text-white/40" /><span className="text-white/50 text-sm font-semibold">PlayerPoints Terms &amp; Conditions</span></div>
            <div className="space-y-3 mb-4">{DISCLAIMER_PARAGRAPHS.map((para, i) => <p key={i} className="text-white/50 text-xs leading-relaxed">{para}</p>)}</div>
            <p className="text-white/30 text-xs border-t border-white/10 pt-4">
              For full terms, visit <a href="https://sandlotz.com/terms" target="_blank" rel="noopener noreferrer" className="text-yellow-400/60 hover:text-yellow-400 underline">sandlotz.com/terms</a>. Questions? <a href="mailto:support@sandlotz.com" className="text-yellow-400/60 hover:text-yellow-400 underline">support@sandlotz.com</a>
            </p>
          </div>
        </div>
      )}

      {showModal && user && profile && (
        <CreateModal onClose={() => setShowModal(false)} onCreated={l => { setListings(prev => [l, ...prev]); setShowModal(false); showToast('Listing posted!') }}
          uid={user.uid} displayName={profile.displayName} city={profile.city} />
      )}

      <AnimatePresence>
        {redeemingPerk && user && (
          <RedeemModal perk={redeemingPerk} onClose={() => setRedeemingPerk(null)} onConfirm={() => handleRedeem(redeemingPerk)} />
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </main>
  )
}
