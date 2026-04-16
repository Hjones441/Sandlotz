'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getPerks, redeemPerk, getUserRedemptions } from '@/lib/firestore'
import type { Perk, Redemption } from '@/lib/firestore'
import Link from 'next/link'
import AppHeader from '@/components/layout/AppHeader'
import {
  Gift, Star, Zap, Trophy, Clock, Lock, AlertCircle, ExternalLink,
  CheckCircle2, Copy, Check, X, Loader2, TrendingUp, Flame, ChevronRight,
} from 'lucide-react'

const PERK_CATEGORIES = ['All', 'Gear', 'Events', 'Services', 'Digital', 'Premium']

const DISCLAIMER_ITEMS = [
  'PlayerPoints have no cash value and are not transferable.',
  'Redemptions are final. Points cannot be refunded once a perk is claimed.',
  'Sandlotz reserves the right to modify or remove perks at any time.',
  'Points earned through fraudulent activity will be voided and accounts suspended.',
  'Perks are fulfilled by third-party sponsors. Sandlotz is not responsible for sponsor fulfillment delays.',
  'Monthly point resets apply to streak bonus points only. Base earned points never expire.',
]

// ─── RedeemModal ──────────────────────────────────────────────────────────────

function RedeemModal({ perk, balance, onConfirm, onClose, loading, error }: {
  perk: Perk
  balance: number
  onConfirm: () => void
  onClose: () => void
  loading: boolean
  error: string
}) {
  const canAfford = balance >= perk.cost
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative sz-card p-6 w-full max-w-sm">
        <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="text-4xl mb-3 text-center">{perk.emoji}</div>
        <h3 className="text-lg font-black text-white text-center mb-1">{perk.title}</h3>
        <p className="text-white/50 text-sm text-center mb-4">{perk.brand}</p>
        <p className="text-white/70 text-sm mb-5 leading-relaxed">{perk.description}</p>

        <div className="bg-white/5 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs">Cost</p>
            <p className="text-brand-yellow font-black text-xl">{perk.cost.toLocaleString()} pts</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs">Your balance</p>
            <p className={`font-black text-xl ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
              {balance.toLocaleString()} pts
            </p>
          </div>
        </div>

        {!canAfford && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 text-red-400 text-sm text-center">
            You need {(perk.cost - balance).toLocaleString()} more points.{' '}
            <Link href="/log-activity" className="underline font-bold" onClick={onClose}>Log a workout →</Link>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {perk.totalQty !== -1 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>Inventory</span>
              <span>{perk.remaining} / {perk.totalQty} left</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full">
              <div className="h-1.5 bg-brand-yellow rounded-full transition-all"
                style={{ width: `${(perk.remaining / perk.totalQty) * 100}%` }} />
            </div>
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={!canAfford || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Redeeming…</>
            : <><Gift className="w-4 h-4" /> Confirm Redemption</>
          }
        </button>
      </motion.div>
    </div>
  )
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────

function SuccessModal({ code, perk, onClose }: { code: string; perk: Perk; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative sz-card p-6 w-full max-w-sm text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
          className="text-5xl mb-3">{perk.emoji}</motion.div>
        <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
        <h3 className="text-xl font-black text-white mb-1">Perk Redeemed!</h3>
        <p className="text-white/50 text-sm mb-5">Show this code to claim your reward</p>

        <div className="bg-white/5 border border-brand-yellow/30 rounded-xl p-4 mb-4">
          <p className="text-white/40 text-xs mb-1">Your redemption code</p>
          <p className="text-brand-yellow font-black text-2xl tracking-widest">{code}</p>
        </div>

        <button onClick={copyCode}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-semibold text-white transition-all mb-3">
          {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
        </button>

        <p className="text-white/30 text-xs mb-4">{perk.description}</p>
        <button onClick={onClose} className="btn-ghost w-full text-sm">Done</button>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerksPage() {
  const { user, profile, refreshProfile } = useAuth()

  const [perks,            setPerks]            = useState<Perk[]>([])
  const [redemptions,      setRedemptions]       = useState<Redemption[]>([])
  const [loading,          setLoading]           = useState(true)
  const [activeCategory,   setActiveCategory]    = useState('All')
  const [activeTab,        setActiveTab]         = useState<'store' | 'mine'>('store')
  const [selectedPerk,     setSelectedPerk]      = useState<Perk | null>(null)
  const [redeemLoading,    setRedeemLoading]     = useState(false)
  const [redeemError,      setRedeemError]       = useState('')
  const [successCode,      setSuccessCode]       = useState<{ code: string; perk: Perk } | null>(null)

  const balance = profile?.pointsBalance ?? profile?.totalScore ?? 0

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [p, r] = await Promise.all([getPerks(), getUserRedemptions(user.uid)])
      setPerks(p)
      setRedemptions(r)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleRedeem() {
    if (!user || !selectedPerk?.id) return
    setRedeemError('')
    setRedeemLoading(true)
    try {
      const code = await redeemPerk(user.uid, selectedPerk.id)
      await refreshProfile()
      await fetchData()
      setSuccessCode({ code, perk: selectedPerk })
      setSelectedPerk(null)
    } catch (err: unknown) {
      setRedeemError(err instanceof Error ? err.message : 'Redemption failed. Try again.')
    } finally {
      setRedeemLoading(false)
    }
  }

  const filtered = perks.filter(p => activeCategory === 'All' || p.category === activeCategory)

  return (
    <>
      <div className="max-w-5xl mx-auto pb-4">
        <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
          <AppHeader title="Perks" subtitle="Redeem PlayerPoints for rewards"
            right={<Gift className="w-5 h-5 text-brand-yellow" />} />
        </div>
        <div className="px-4 pt-4 pb-24">

          {/* ── HERO BALANCE BANNER ─────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl mb-5 bg-gradient-to-br from-brand-yellow/20 via-brand-purple/40 to-[#0e0825] border border-brand-yellow/25 p-5">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-yellow/10 blur-[60px]" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/50 text-xs mb-0.5 font-medium uppercase tracking-wider">Your PlayerPoints</p>
                  <p className="text-4xl font-black text-brand-yellow leading-none">{balance.toLocaleString()}</p>
                  <p className="text-white/40 text-xs mt-1">Available to redeem</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-brand-yellow" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/log-activity"
                  className="flex items-center gap-1.5 bg-brand-yellow text-brand-purple-dark text-xs font-black px-4 py-2 rounded-xl">
                  <Zap className="w-3.5 h-3.5" /> Earn More Points
                </Link>
                <Link href="/challenges"
                  className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  <Trophy className="w-3.5 h-3.5" /> View Challenges
                </Link>
              </div>
            </div>
          </div>

          {/* ── HOW TO EARN ─────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">How to Earn More</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { emoji: '🏋️', label: 'Log Workout',     pts: '+50-300 PP', href: '/log-activity' },
                { emoji: '🏆', label: 'Join Challenge',   pts: '+200-750 PP', href: '/challenges'  },
                { emoji: '⚡', label: 'Connect Device',   pts: '+5% bonus',   href: '/log-activity' },
              ].map(s => (
                <Link key={s.label} href={s.href}
                  className="bg-white/[0.03] rounded-xl p-3 hover:bg-white/[0.07] transition-colors">
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <p className="text-white/60 text-[10px] font-bold">{s.label}</p>
                  <p className="text-brand-yellow text-[10px] font-black mt-0.5">{s.pts}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── SPONSOR SPOTLIGHT ───────────────────────────────────────── */}
          {!loading && perks.filter(p => p.sponsored && p.available).length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-black text-white">Sponsor Spotlight</span>
                <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 font-bold ml-1">
                  Featured Brands
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {perks.filter(p => p.sponsored && p.available).map(perk => {
                  const canAfford = balance >= perk.cost
                  return (
                    <motion.div key={perk.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex-shrink-0 w-52 bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden cursor-pointer hover:border-brand-yellow/30 transition-all"
                      onClick={() => { setRedeemError(''); setSelectedPerk(perk) }}>
                      <div className="bg-gradient-to-br from-brand-yellow/20 to-brand-purple/30 h-24 flex items-center justify-center relative">
                        <span className="text-5xl">{perk.emoji}</span>
                        {perk.flash && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">FLASH</span>
                        )}
                        <span className="absolute bottom-2 left-2 bg-brand-yellow text-brand-purple-dark text-[9px] font-black px-2 py-0.5 rounded-full">
                          SPONSORED
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-white/35 mb-0.5">{perk.brand}</p>
                        <p className="text-white font-bold text-xs leading-tight line-clamp-2 mb-2">{perk.title}</p>
                        <div className={`flex items-center justify-between`}>
                          <div className={`flex items-center gap-1 text-[11px] font-black ${canAfford ? 'text-brand-yellow' : 'text-white/30'}`}>
                            <Star className="w-3 h-3" />
                            {perk.cost.toLocaleString()} pts
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${canAfford ? 'bg-brand-yellow/15 text-brand-yellow' : 'bg-white/5 text-white/25'}`}>
                            {canAfford ? 'Redeem' : 'Locked'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Flash deals */}
          {!loading && perks.filter(p => p.flash && p.available).length > 0 && (
            <div className="mb-5 bg-red-500/8 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm font-black text-white">⚡ Flash Deals</span>
                <span className="text-[10px] bg-red-500/15 text-red-400 rounded-full px-2 py-0.5 font-bold ml-1">LIMITED TIME</span>
              </div>
              <div className="space-y-2">
                {perks.filter(p => p.flash && p.available).map(perk => {
                  const canAfford = balance >= perk.cost
                  return (
                    <div key={perk.id}
                      onClick={() => { setRedeemError(''); setSelectedPerk(perk) }}
                      className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 cursor-pointer hover:border-red-400/30 transition-all">
                      <span className="text-2xl">{perk.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{perk.title}</p>
                        <p className="text-white/35 text-xs">{perk.brand}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-black text-sm ${canAfford ? 'text-brand-yellow' : 'text-white/30'}`}>{perk.cost.toLocaleString()} pts</p>
                        <p className={`text-[10px] ${canAfford ? 'text-green-400' : 'text-white/20'}`}>{canAfford ? '✓ Can redeem' : 'Need more PP'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-5">
            {(['store', 'mine'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  activeTab === tab ? 'bg-brand-yellow text-brand-purple-dark' : 'text-white/50 hover:text-white'
                }`}>
                {tab === 'store' ? '🎁 Perks Store' : `📜 My Redemptions${redemptions.length ? ` (${redemptions.length})` : ''}`}
              </button>
            ))}
          </div>

          {/* ── STORE TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'store' && (
            <>
              {/* Category filters */}
              <div className="flex gap-2 flex-wrap mb-5">
                {PERK_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-brand-yellow text-brand-purple-dark font-bold'
                        : 'text-white/60 hover:text-white border border-white/10'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-yellow/60" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No perks in this category yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                  {filtered.map(perk => {
                    const canAfford = balance >= perk.cost
                    return (
                      <motion.div key={perk.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`sz-card overflow-hidden flex flex-col ${!perk.available ? 'opacity-60' : ''}`}>
                        {perk.flash && (
                          <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-4 py-2 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-yellow-400 text-xs font-bold">Flash — limited time</span>
                          </div>
                        )}

                        <div className="bg-white/10 aspect-video flex items-center justify-center relative">
                          <span className="text-5xl">{perk.emoji}</span>
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            {perk.sponsored && (
                              <span className="bg-brand-yellow text-brand-purple-dark text-xs font-bold px-2 py-0.5 rounded-full">Sponsored</span>
                            )}
                            {!perk.available && (
                              <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Sold Out
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-xs text-white/40 mb-1">{perk.brand} · {perk.category}</p>
                          <p className="text-white font-bold mb-1">{perk.title}</p>
                          <p className="text-white/60 text-sm mb-3 flex-1 leading-relaxed line-clamp-2">{perk.description}</p>

                          {/* Inventory bar */}
                          {perk.totalQty !== -1 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                                <span>Inventory</span>
                                <span>{perk.remaining} left</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full">
                                <div className="h-1 bg-brand-yellow/60 rounded-full transition-all"
                                  style={{ width: `${(perk.remaining / perk.totalQty) * 100}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 font-black">{perk.cost.toLocaleString()}</span>
                              <span className="text-white/40 text-xs">pts</span>
                            </div>
                            {!canAfford && perk.available && (
                              <span className="text-white/40 text-xs">
                                -{(perk.cost - balance).toLocaleString()} pts
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => { setRedeemError(''); setSelectedPerk(perk) }}
                            disabled={!perk.available}
                            className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {!perk.available
                              ? <><Lock className="w-4 h-4" /> Sold Out</>
                              : !canAfford
                              ? <><Zap className="w-4 h-4" /> Need More Points</>
                              : <><Gift className="w-4 h-4" /> Redeem</>
                            }
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Earn CTA */}
              <div className="sz-card p-6 flex flex-col sm:flex-row items-center gap-5 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-white">Want More Points?</span>
                  </div>
                  <p className="text-white/60 text-sm">Log activities, complete challenges, and connect apps for bonus points.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Link href="/log-activity" className="btn-primary text-sm !py-2 !px-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Log Activity
                  </Link>
                  <Link href="/challenges" className="btn-ghost text-sm !py-2 !px-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Challenges
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ── MY REDEMPTIONS TAB ─────────────────────────────────────────── */}
          {activeTab === 'mine' && (
            <div className="space-y-4 mb-10">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-yellow/60" />
                </div>
              ) : redemptions.length === 0 ? (
                <div className="text-center py-16">
                  <Gift className="w-10 h-10 mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 mb-2">No redemptions yet.</p>
                  <button onClick={() => setActiveTab('store')} className="text-brand-yellow text-sm font-bold hover:underline">
                    Browse the store →
                  </button>
                </div>
              ) : (
                redemptions.map(r => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="sz-card p-4 flex items-center gap-4">
                    <span className="text-3xl shrink-0">{r.perkEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{r.perkTitle}</p>
                      <p className="text-white/40 text-xs">
                        {r.redeemedAt?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? ''}
                        {' · '}{r.cost.toLocaleString()} pts
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-brand-yellow font-black text-sm tracking-wider">{r.code}</p>
                      <p className="text-white/30 text-[10px]">Redemption code</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

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
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedPerk && (
          <RedeemModal
            perk={selectedPerk} balance={balance}
            onConfirm={handleRedeem} onClose={() => setSelectedPerk(null)}
            loading={redeemLoading} error={redeemError}
          />
        )}
        {successCode && (
          <SuccessModal code={successCode.code} perk={successCode.perk} onClose={() => setSuccessCode(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
