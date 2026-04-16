'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getMarketplaceListings } from '@/lib/firestore'
import type { MarketplaceListing } from '@/lib/firestore'
import AppHeader from '@/components/layout/AppHeader'
import { SPORT_OPTIONS } from '@/lib/sandlotzScore'
import {
  Search, PlusCircle, Tag, Users, ShoppingBag,
  X, Mail, Loader2, MapPin,
} from 'lucide-react'

const CATEGORIES = ['All', 'Equipment', 'Apparel', 'Footwear', 'Accessories', 'Other']

const CONDITION_COLORS: Record<string, string> = {
  'New':       'text-green-400  bg-green-400/10  border-green-400/20',
  'Like New':  'text-blue-400   bg-blue-400/10   border-blue-400/20',
  'Good':      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Fair':      'text-orange-400 bg-orange-400/10 border-orange-400/20',
}

// ─── Listing Detail Modal ─────────────────────────────────────────────────────

function ListingModal({ listing, onClose }: { listing: MarketplaceListing; onClose: () => void }) {
  const sportEntry = SPORT_OPTIONS.find(s => s.value === listing.sport)
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-[#120a2e] rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-black">{listing.title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Price */}
          <div className="text-center">
            <p className="text-4xl font-black text-brand-yellow">
              {listing.price === 0 ? 'Free' : `$${listing.price}`}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {listing.sport !== 'other' && sportEntry && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                {sportEntry.emoji} {sportEntry.label}
              </span>
            )}
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
              {listing.category}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CONDITION_COLORS[listing.condition] ?? 'text-white/60 bg-white/5 border-white/10'}`}>
              {listing.condition}
            </span>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm leading-relaxed">{listing.description}</p>

          {/* Seller info */}
          <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-black">
              {listing.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{listing.displayName}</p>
              <p className="text-white/40 text-xs">Seller</p>
            </div>
          </div>

          {/* Contact */}
          <a href={`mailto:${listing.contactEmail}?subject=Re: ${encodeURIComponent(listing.title)} on Sandlotz`}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Contact Seller
          </a>

          <p className="text-white/20 text-xs text-center">
            Listed {listing.createdAt?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? ''}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { user } = useAuth()

  const [listings,       setListings]       = useState<MarketplaceListing[]>([])
  const [loading,        setLoading]        = useState(true)
  const [sportFilter,    setSportFilter]    = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search,         setSearch]         = useState('')
  const [selected,       setSelected]       = useState<MarketplaceListing | null>(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMarketplaceListings()
      setListings(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchListings() }, [fetchListings])

  const filtered = listings.filter(l => {
    const matchesSport    = sportFilter    === 'all' || l.sport === sportFilter
    const matchesCategory = categoryFilter === 'All' || l.category === categoryFilter
    const q = search.toLowerCase()
    const matchesSearch   = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    return matchesSport && matchesCategory && matchesSearch
  })

  const sportOptions = [{ value: 'all', label: 'All Sports', emoji: '🏅' }, ...SPORT_OPTIONS]

  return (
    <>
      <div className="max-w-6xl mx-auto pb-4">
        <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
          <AppHeader title="Marketplace" subtitle="Buy · sell · connect with athletes"
            right={
              <Link href="/marketplace/new" className="flex items-center gap-1.5 bg-brand-yellow text-brand-purple-dark text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-yellow-300 transition-colors">
                <PlusCircle className="w-3.5 h-3.5" /> Post
              </Link>
            }
          />
        </div>
        <div className="px-4 pt-4 pb-24">

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search gear, apparel, footwear…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors" />
          </div>

          {/* Sport filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
            {sportOptions.map(s => (
              <button key={s.value} onClick={() => setSportFilter(s.value)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  sportFilter === s.value
                    ? 'bg-brand-yellow text-brand-purple-dark'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}>
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-brand-yellow text-brand-purple-dark'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Listings */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-yellow/60" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 mb-2">No listings found.</p>
              {user && (
                <Link href="/marketplace/new" className="text-brand-yellow font-bold text-sm hover:underline">
                  Be the first to post →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(listing => {
                const sportEntry = SPORT_OPTIONS.find(s => s.value === listing.sport)
                return (
                  <motion.button key={listing.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelected(listing)}
                    className="sz-card overflow-hidden text-left flex flex-col hover:border-brand-yellow/30 transition-colors group">

                    {/* Image / placeholder */}
                    <div className="bg-white/10 aspect-video flex items-center justify-center relative">
                      {listing.imageUrls?.[0]
                        ? <img src={listing.imageUrls[0]} alt={listing.title} className="object-cover w-full h-full" />
                        : <Tag className="w-10 h-10 text-white/20" />
                      }
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CONDITION_COLORS[listing.condition] ?? ''}`}>
                          {listing.condition}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-white/40 text-[10px]">{sportEntry?.emoji} {listing.category}</span>
                      </div>
                      <p className="text-white font-bold text-sm mb-1 group-hover:text-brand-yellow transition-colors line-clamp-1">
                        {listing.title}
                      </p>
                      <p className="text-white/50 text-xs mb-3 flex-1 line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-brand-yellow font-black">
                          {listing.price === 0 ? 'Free' : `$${listing.price}`}
                        </p>
                        <div className="flex items-center gap-1 text-white/30">
                          <Users className="w-3 h-3" />
                          <span className="text-[10px]">{listing.displayName}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Post CTA */}
          {user && (
            <div className="mt-8 sz-card p-5 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-white font-bold mb-0.5">Have gear to sell?</p>
                <p className="text-white/50 text-sm">Post a listing and connect with local athletes.</p>
              </div>
              <Link href="/marketplace/new" className="btn-primary text-sm !py-2 !px-4 flex items-center gap-2 shrink-0">
                <PlusCircle className="w-4 h-4" /> Post Now
              </Link>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  )
}
