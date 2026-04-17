'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getPerks, redeemPerk, getUserRedemptions } from '@/lib/firestore'
import type { Perk, Redemption } from '@/lib/firestore'
import AppHeader from '@/components/layout/AppHeader'
import {
  Search, Gift, Zap, Star, Trophy, CheckCircle2, X,
  Lock, Loader2, ChevronRight, ExternalLink, BadgeCheck,
  Sparkles, Tag, Users, Mail,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SponsorBrand {
  name:      string
  perks:     Perk[]
  sponsored: boolean
  minCost:   number
  maxCost:   number
  category:  string
}

const CATEGORIES = ['All', 'Gear', 'Events', 'Services', 'Digital', 'Premium']

// ─── Brand Detail Modal ───────────────────────────────────────────────────────

function BrandModal({
  brand, balance, redemptions, onClose,
}: {
  brand:       SponsorBrand
  balance:     number
  redemptions: Redemption[]
  onClose:     () => void
}) {
  const { user } = useAuth()

  const [redeeming,  setRedeeming]  = useState<string | null>(null)
  const [redeemed,   setRedeemed]   = useState<string | null>(null)
  const [code,       setCode]       = useState<string | null>(null)
  const [err,        setErr]        = useState('')
  const [localBal,   setLocalBal]   = useState(balance)
  const [copied,     setCopied]     = useState(false)

  const alreadyRedeemedIds = new Set(redemptions.map(r => r.perkId))

  async function handleRedeem(perk: Perk) {
    if (!user || !perk.id) return
    setRedeeming(perk.id)
    setErr('')
    try {
      const redemptionCode = await redeemPerk(user.uid, perk.id)
      setCode(redemptionCode)
      setRedeemed(perk.id)
      setLocalBal(b => b - perk.cost)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Redemption failed.')
    } finally {
      setRedeeming(null)
    }
  }

  function copyCode() {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const leadPerk = brand.perks[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-lg bg-[#120a2e] rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden">

        {/* Brand Header */}
        <div className="bg-white/[0.04] border-b border-white/[0.07] p-6">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
              {leadPerk?.emoji ?? '🏷️'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-white font-black text-xl">{brand.name}</h2>
                {brand.sponsored && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/25">
                    <BadgeCheck className="w-3 h-3" /> Partner
                  </span>
                )}
              </div>
              <p className="text-white/50 text-xs">{brand.category}</p>
              <p className="text-white/30 text-[11px] mt-0.5">
                {brand.perks.length} reward{brand.perks.length !== 1 ? 's' : ''} ·{' '}
                {brand.minCost.toLocaleString()}
                {brand.maxCost !== brand.minCost ? `–${brand.maxCost.toLocaleString()}` : ''} pts
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2 w-fit">
            <Zap className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
            <span className="text-white/50 text-xs">Balance: <span className="text-white font-bold">{localBal.toLocaleString()} pts</span></span>
          </div>
        </div>

        {/* Offers list */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">

          {err && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              <X className="w-4 h-4 flex-shrink-0" /> {err}
            </div>
          )}

          {redeemed && code && (
            <div className="bg-white/[0.04] border border-brand-yellow/20 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">{brand.perks.find(p => p.id === redeemed)?.emoji}</div>
              <CheckCircle2 className="w-7 h-7 text-green-400 mx-auto mb-2" />
              <p className="text-white font-black mb-1">Reward Claimed!</p>
              <p className="text-white/40 text-xs mb-4">Show this code to the sponsor or enter at checkout.</p>
              <div className="flex items-center justify-center gap-3 bg-white/[0.06] border border-brand-yellow/20 rounded-xl px-5 py-3 mb-3">
                <span className="text-brand-yellow font-black tracking-widest text-xl">{code}</span>
                <button
                  onClick={copyCode}
                  aria-label="Copy code"
                  className="text-white/30 hover:text-brand-yellow transition-colors">
                  {copied
                    ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/>
                      </svg>
                  }
                </button>
              </div>
              <p className="text-white/20 text-[10px]">Also visible in your profile redemption history.</p>
            </div>
          )}

          {brand.perks.map(perk => {
            const canAfford    = localBal >= perk.cost
            const soldOut      = perk.remaining === 0 && perk.totalQty !== -1
            const alreadyHave  = alreadyRedeemedIds.has(perk.id ?? '')
            const isRedeeming  = redeeming === perk.id
            const justRedeemed = redeemed === perk.id

            return (
              <motion.div key={perk.id ?? perk.title}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 flex items-start gap-4">

                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center text-2xl flex-shrink-0">
                  {perk.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-white font-bold text-sm">{perk.title}</p>
                    {perk.flash && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20">
                        ⚡ FLASH
                      </span>
                    )}
                    {perk.sponsored && !brand.sponsored && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/50 border border-white/[0.08]">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">{perk.description}</p>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-yellow font-black">{perk.cost.toLocaleString()}</span>
                      <span className="text-white/30 text-xs">pts</span>
                      {perk.totalQty !== -1 && (
                        <span className={`text-[10px] font-semibold ${soldOut ? 'text-red-400/70' : 'text-white/25'}`}>
                          · {soldOut ? 'Sold out' : `${perk.remaining} left`}
                        </span>
                      )}
                    </div>

                    {justRedeemed ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : alreadyHave ? (
                      <span className="text-xs text-white/25 font-semibold">Redeemed</span>
                    ) : soldOut ? (
                      <span className="text-xs text-red-400/50 font-semibold">Sold out</span>
                    ) : !perk.available ? (
                      <span className="text-xs text-white/20 font-semibold">Unavailable</span>
                    ) : !canAfford ? (
                      <div className="flex items-center gap-1 text-xs text-white/30">
                        <Lock className="w-3 h-3" />
                        <span>{(perk.cost - localBal).toLocaleString()} short</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRedeem(perk)}
                        disabled={isRedeeming}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-yellow text-brand-purple-dark hover:bg-yellow-300 disabled:opacity-50 transition-colors active:scale-95">
                        {isRedeeming
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Gift className="w-3 h-3" />}
                        Redeem
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Earn more nudge */}
          {brand.perks.every(p => localBal < p.cost) && !redeemed && (
            <div className="text-center pt-2 pb-1">
              <p className="text-white/25 text-xs mb-2">Need more points to unlock these rewards?</p>
              <Link href="/log-activity" onClick={onClose}
                className="inline-flex items-center gap-1.5 text-brand-yellow text-xs font-bold hover:underline">
                <Zap className="w-3 h-3" /> Log a workout to earn pts
              </Link>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <p className="text-white/15 text-[10px] leading-relaxed text-center">
            Rewards fulfilled by {brand.name}. Sandlotz is not responsible for fulfillment.
            Points have no cash value. Redemptions are final.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Brand Card ───────────────────────────────────────────────────────────────

function BrandCard({
  brand, balance, index, onClick,
}: {
  brand:   SponsorBrand
  balance: number
  index:   number
  onClick: () => void
}) {
  const affordable = brand.perks.some(p => balance >= p.cost && p.available)
  const leadPerk   = brand.perks.find(p => p.sponsored) ?? brand.perks[0]

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="sz-card overflow-hidden text-left hover:border-brand-yellow/30 active:scale-[0.98] transition-all group flex flex-col">

      {/* Card header */}
      <div className="bg-white/[0.04] border-b border-white/[0.06] p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.07] border border-white/[0.08] flex items-center justify-center text-3xl flex-shrink-0">
            {leadPerk?.emoji ?? '🏷️'}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {brand.sponsored && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20">
                <BadgeCheck className="w-2.5 h-2.5" /> PARTNER
              </span>
            )}
            {affordable && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 border border-white/[0.08]">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> CAN REDEEM
              </span>
            )}
          </div>
        </div>

        <h3 className="text-white font-black text-base group-hover:text-brand-yellow transition-colors leading-tight">
          {brand.name}
        </h3>
        <p className="text-white/40 text-xs mt-0.5">{brand.category}</p>
      </div>

      {/* Preview + footer */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {leadPerk && (
          <div>
            <p className="text-white/80 text-sm font-semibold line-clamp-1">{leadPerk.title}</p>
            <p className="text-white/40 text-xs mt-0.5 line-clamp-2 leading-relaxed">{leadPerk.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
          <div>
            <span className="text-brand-yellow font-black text-sm">{brand.minCost.toLocaleString()}</span>
            {brand.maxCost !== brand.minCost && (
              <span className="text-white/25 text-xs">–{brand.maxCost.toLocaleString()}</span>
            )}
            <span className="text-white/25 text-xs"> pts</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/35 group-hover:text-brand-yellow transition-colors">
            <span>{brand.perks.length} offer{brand.perks.length !== 1 ? 's' : ''}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { user, profile } = useAuth()

  const balance = profile?.pointsBalance ?? 0

  const [perks,       setPerks]       = useState<Perk[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('All')
  const [onlyAfford,  setOnlyAfford]  = useState(false)
  const [selected,    setSelected]    = useState<SponsorBrand | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [perksData, redemptionsData] = await Promise.all([
        getPerks(),
        user ? getUserRedemptions(user.uid) : Promise.resolve([]),
      ])
      setPerks(perksData)
      setRedemptions(redemptionsData as Redemption[])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  // Group perks by brand
  const brands = useMemo<SponsorBrand[]>(() => {
    const map = new Map<string, Perk[]>()
    perks.forEach(p => {
      const list = map.get(p.brand) ?? []
      map.set(p.brand, [...list, p])
    })
    return Array.from(map.entries())
      .map(([name, brandPerks]) => {
        const costs = brandPerks.map(p => p.cost)
        return {
          name,
          perks:     brandPerks,
          sponsored: brandPerks.some(p => p.sponsored),
          minCost:   Math.min(...costs),
          maxCost:   Math.max(...costs),
          category:  brandPerks[0]?.category ?? 'Other',
        }
      })
      .sort((a, b) => {
        if (a.sponsored && !b.sponsored) return -1
        if (!a.sponsored && b.sponsored) return 1
        return a.name.localeCompare(b.name)
      })
  }, [perks])

  const filtered = useMemo(() => brands.filter(b => {
    const matchesCat    = category === 'All' || b.category === category
    const q             = search.toLowerCase()
    const matchesSearch = !q || b.name.toLowerCase().includes(q) ||
                          b.perks.some(p =>
                            p.title.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q))
    const matchesAfford = !onlyAfford || b.perks.some(p => balance >= p.cost && p.available)
    return matchesCat && matchesSearch && matchesAfford
  }), [brands, category, search, onlyAfford, balance])

  const partnerCount  = brands.filter(b => b.sponsored).length
  const liveRewards   = perks.filter(p => p.available).length

  return (
    <>
      <div className="max-w-6xl mx-auto pb-4">

        <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
          <AppHeader
            title="Sponsor Marketplace"
            subtitle={`${partnerCount} brand partner${partnerCount !== 1 ? 's' : ''} · redeem rewards for your fitness`}
          />
        </div>

        <div className="px-4 pt-5 pb-28 space-y-5">

          {/* Balance banner */}
          <div className="sz-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-yellow/15 border border-brand-yellow/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-brand-yellow" />
              </div>
              <div>
                <p className="text-white font-black text-xl leading-none">
                  {balance.toLocaleString()} <span className="text-brand-yellow text-base">pts</span>
                </p>
                <p className="text-white/35 text-xs mt-0.5">Your PlayerPoints balance</p>
              </div>
            </div>
            <Link href="/log-activity"
              className="btn-primary text-sm !py-2 !px-4 flex items-center gap-1.5 shrink-0">
              <Zap className="w-3.5 h-3.5" /> Earn More
            </Link>
          </div>

          {/* How it works */}
          <div className="sz-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              <p className="text-white font-bold text-sm">How Sponsor Rewards Work</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { emoji: '🏃', label: 'Work out', sub: 'Earn PlayerPoints' },
                { emoji: '🏷️', label: 'Browse brands', sub: 'Find rewards you want' },
                { emoji: '🎁', label: 'Redeem', sub: 'Instant digital code' },
              ].map(step => (
                <div key={step.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-2xl">{step.emoji}</span>
                  <p className="text-white text-xs font-bold">{step.label}</p>
                  <p className="text-white/30 text-[10px] leading-snug">{step.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brands or rewards…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-yellow/40 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    category === cat
                      ? 'bg-brand-yellow text-brand-purple-dark'
                      : 'bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOnlyAfford(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                onlyAfford
                  ? 'bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/25'
                  : 'bg-white/[0.05] border border-white/[0.08] text-white/45 hover:text-white'
              }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              I Can Redeem
            </button>
          </div>

          {/* Brand grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-yellow/50" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="w-12 h-12 mx-auto mb-3 text-white/15" />
              <p className="text-white/40 text-sm mb-3">
                {onlyAfford ? 'No rewards in your points range right now.' : 'No sponsors match your search.'}
              </p>
              {onlyAfford
                ? <Link href="/log-activity" className="text-brand-yellow font-bold text-sm hover:underline">Earn more points →</Link>
                : <button onClick={() => { setSearch(''); setCategory('All') }} className="text-brand-yellow font-bold text-sm hover:underline">Clear filters</button>
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((brand, i) => (
                <BrandCard
                  key={brand.name}
                  brand={brand}
                  balance={balance}
                  index={i}
                  onClick={() => setSelected(brand)}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && brands.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Users className="w-4 h-4 text-white/50" />,      value: brands.length,   label: 'Sponsors'     },
                { icon: <Gift className="w-4 h-4 text-brand-yellow" />,   value: liveRewards,     label: 'Live Rewards' },
                { icon: <Trophy className="w-4 h-4 text-brand-yellow" />, value: partnerCount,    label: 'Partners'     },
              ].map(stat => (
                <div key={stat.label} className="sz-card p-4 text-center">
                  <div className="flex justify-center mb-1.5">{stat.icon}</div>
                  <p className="text-white font-black text-2xl leading-none">{stat.value}</p>
                  <p className="text-white/30 text-[10px] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Become a Sponsor */}
          <div className="sz-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/20 flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-brand-yellow" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">For Brands</p>
                <h3 className="text-white font-black text-base mb-2">Become a Sponsor Partner</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  Reach thousands of active athletes. Offer rewards, build brand loyalty, and grow with the Sandlotz community.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:partnerships@sandlotz.com?subject=Sponsor%20Partnership%20Inquiry"
                    className="btn-primary text-sm !py-2.5 !px-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Partner with Us
                  </a>
                  <a href="https://sandlotz.com" target="_blank" rel="noopener noreferrer"
                    className="btn-ghost text-sm !py-2.5 !px-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-white/15 text-[10px] leading-relaxed text-center px-4">
            PlayerPoints have no cash value and are non-transferable. Redemptions are final.
            Rewards fulfilled by third-party sponsors — Sandlotz is not responsible for fulfillment delays.
            Sandlotz reserves the right to modify or remove any reward at any time.
          </p>

        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <BrandModal
            brand={selected}
            balance={balance}
            redemptions={redemptions}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
