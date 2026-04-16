'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserActivities } from '@/lib/firestore'
import { redeemPerk } from '@/lib/firestore'
import { getRankTier } from '@/lib/sandlotzScore'
import type { Activity } from '@/lib/firestore'
import AppHeader from '@/components/layout/AppHeader'
import {
  Gift, Star, Zap, Trophy, Clock, Lock, AlertCircle,
  ExternalLink, CheckCircle, X, Loader2, TrendingUp, Shield,
} from 'lucide-react'

// ─── Tier requirements ────────────────────────────────────────────────────────
// Keyed by perk id → minimum tier index (0=Rookie,1=Athlete,2=Pro,3=Elite,4=Legend)
const TIER_REQ: Record<string, number> = {
  '6': 2,  // Sandlotz Pro — requires Pro tier
  '8': 2,  // 1-on-1 Coaching — requires Pro tier
  '4': 1,  // Fitness Assessment — requires Athlete
}

const PERK_CATEGORIES = ['All', 'Gear', 'Events', 'Services', 'Digital', 'Premium']

const PERKS = [
  { id:'1', title:'20% Off Nike Gear',         cost:500,  brand:'Nike',        category:'Gear',     emoji:'👟', desc:'Discount code for Nike.com. Valid on full-price items. Expires 30 days after redemption.', sponsored:true,  available:true },
  { id:'2', title:'Free Protein Shake',         cost:200,  brand:'GNC',         category:'Services', emoji:'💪', desc:'Redeemable at any GNC location. One per account. Present app on pickup.',               sponsored:true,  available:true },
  { id:'3', title:'Columbus FC Tickets',        cost:1000, brand:'Columbus FC', category:'Events',   emoji:'⚽', desc:'2 tickets to a home match. Seat selection subject to availability.',                    sponsored:true,  available:true },
  { id:'4', title:'Fitness Assessment',         cost:750,  brand:'FitLab',      category:'Services', emoji:'📊', desc:'Full performance analysis — VO2 max, body composition, movement screening.',           sponsored:false, available:true },
  { id:'5', title:'$25 SportChek Credit',       cost:300,  brand:'SportChek',   category:'Digital',  emoji:'🏬', desc:'In-store or online credit. No minimum purchase required.',                              sponsored:false, available:true },
  { id:'6', title:'Sandlotz Pro — 1 Month',     cost:400,  brand:'Sandlotz',    category:'Premium',  emoji:'⭐', desc:'Advanced analytics, unlimited listing boosts, early challenge access, exclusive badges.',sponsored:false, available:true },
  { id:'7', title:'Garmin Watch Raffle',        cost:150,  brand:'Garmin',      category:'Gear',     emoji:'⌚', desc:'Enter to win a Garmin Forerunner 265. Drawing every Friday.',                          sponsored:true,  available:true, flash:true, flashEnds:'2h 14m' },
  { id:'8', title:'1-on-1 Coaching Session',    cost:600,  brand:'CoachHub',    category:'Services', emoji:'🏀', desc:'60-min personalized coaching with a certified trainer. Book within 7 days.',            sponsored:false, available:true },
]

const DISCLAIMER_ITEMS = [
  'PlayerPoints have no cash value and are not transferable.',
  'Redemptions are final. Points cannot be refunded once a perk is claimed.',
  'Sandlotz reserves the right to modify or remove perks at any time.',
  'Points earned through fraudulent activity will be voided and accounts suspended.',
  'Perks are fulfilled by third-party sponsors. Sandlotz is not responsible for sponsor fulfillment delays.',
]

const TIER_LABELS = ['Rookie', 'Athlete', 'Pro', 'Elite', 'Legend']

function getTierIndex(score: number): number {
  if (score >= 10000) return 4
  if (score >= 5000)  return 3
  if (score >= 2000)  return 2
  if (score >= 500)   return 1
  return 0
}

// ─── Redemption Modal ─────────────────────────────────────────────────────────

interface RedeemModalProps {
  perk: typeof PERKS[0]
  uid: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

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
      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:30 }}
        className="w-full max-w-md bg-[#1a1040] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
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
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{perk.emoji}</span>
                <div>
                  <p className="font-bold text-white">{perk.title}</p>
                  <p className="text-white/50 text-xs">{perk.brand}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{perk.desc}</p>
            </div>
            <div className="flex items-center justify-between mb-5 bg-yellow-400/10 rounded-xl p-3">
              <span className="text-white/70 text-sm">Points deducted</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-black">{perk.cost.toLocaleString()} PP</span>
              </div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerksPage() {
  const { user, profile } = useAuth()
  const [activeCategory, setActiveCategory] = useState('All')
  const [activities,     setActivities]     = useState<Activity[]>([])
  const [redeemingPerk,  setRedeemingPerk]  = useState<typeof PERKS[0] | null>(null)
  const [redeemedIds,    setRedeemedIds]    = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    getUserActivities(user.uid).then(setActivities).catch(() => {})
  }, [user])

  const balance    = profile?.totalScore ?? 0
  const tierIndex  = getTierIndex(balance)
  const tier       = getRankTier(balance)

  const monthlyEarned = useMemo(() => {
    const start = new Date(); start.setDate(1); start.setHours(0,0,0,0)
    return activities
      .filter(a => new Date((a.createdAt as any).seconds * 1000) >= start)
      .reduce((s, a) => s + a.score, 0)
  }, [activities])

  const monthlyMax = 2000
  const filtered = PERKS.filter(p => activeCategory === 'All' || p.category === activeCategory)

  async function handleRedeem(perk: typeof PERKS[0]) {
    if (!user) return
    await redeemPerk(user.uid, perk.id, perk.title, perk.cost)
    setRedeemedIds(prev => new Set([...prev, perk.id]))
  }

  return (
    <div className="max-w-5xl mx-auto pb-4">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Perks" subtitle="Redeem PlayerPoints for real rewards"
          right={<Gift className="w-5 h-5 text-brand-yellow" />} />
      </div>

      <div className="px-4 pt-4 pb-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-black text-white">Perks Store</h1>
        </div>
        <p className="text-white/50 mb-6">Earn points by training. Spend them on real rewards from brand partners.</p>

        {/* Balance + Tier + Monthly */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">

          {/* Balance */}
          <div className="sz-card p-5 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold text-sm">Your Balance</span>
            </div>
            <p className="text-4xl font-black text-yellow-400 leading-none mb-1">{balance.toLocaleString()}</p>
            <p className="text-white/40 text-xs mb-3">PlayerPoints available</p>
            <Link href="/log-activity" className="text-yellow-400 hover:text-yellow-300 text-xs font-bold transition-colors">
              + Earn more points →
            </Link>
          </div>

          {/* Tier status */}
          <div className="sz-card p-5 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold text-sm">Your Tier</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-sm font-black px-3 py-1 rounded-full border ${tier.badgeClass}`}>{tier.label}</span>
            </div>
            <div className="space-y-1">
              {TIER_LABELS.map((t, i) => (
                <div key={t} className={`flex items-center gap-2 text-xs ${i <= tierIndex ? 'text-yellow-400' : 'text-white/20'}`}>
                  {i < tierIndex ? <CheckCircle className="w-3 h-3" /> : i === tierIndex ? <Star className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-30" />}
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly earnings */}
          <div className="sz-card p-5 border-yellow-400/20 bg-yellow-400/5 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold text-sm">This Month</span>
            </div>
            <p className="text-2xl font-black text-white mb-1">{monthlyEarned.toLocaleString()} <span className="text-sm text-white/40 font-normal">/ {monthlyMax.toLocaleString()}</span></p>
            <div className="h-1.5 bg-white/10 rounded-full mb-2">
              <div className="h-1.5 bg-yellow-400 rounded-full transition-all" style={{ width: `${Math.min(100, (monthlyEarned/monthlyMax)*100)}%` }} />
            </div>
            <p className="text-white/30 text-xs">Points earned from activities</p>
          </div>
        </div>

        {/* Tier unlock banner */}
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

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {PERK_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat ? 'bg-yellow-400 text-purple-900 font-bold' : 'text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Perks grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map(perk => {
            const canAfford   = balance >= perk.cost
            const reqTier     = TIER_REQ[perk.id]
            const tierLocked  = reqTier !== undefined && tierIndex < reqTier
            const isRedeemed  = redeemedIds.has(perk.id)
            const canRedeem   = perk.available && canAfford && !tierLocked && !isRedeemed

            return (
              <motion.div key={perk.id} layout
                className={`sz-card overflow-hidden flex flex-col ${tierLocked ? 'opacity-50' : ''}`}
              >
                {perk.flash && (
                  <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-4 py-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-bold">Flash Auction ends in {perk.flashEnds}</span>
                  </div>
                )}

                <div className="bg-white/10 aspect-video flex items-center justify-center relative">
                  <span className="text-5xl">{perk.emoji}</span>
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {perk.sponsored && (
                      <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">Sponsored</span>
                    )}
                    {tierLocked && (
                      <span className="bg-purple-900/80 text-white/60 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                        <Lock className="w-3 h-3" /> {TIER_LABELS[reqTier!]}+
                      </span>
                    )}
                    {isRedeemed && (
                      <span className="bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Redeemed
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
                    {!canAfford && !tierLocked && perk.available && !isRedeemed && (
                      <span className="text-white/40 text-xs">Need {(perk.cost - balance).toLocaleString()} more</span>
                    )}
                    {tierLocked && (
                      <span className="text-white/30 text-xs">Requires {TIER_LABELS[reqTier!]}</span>
                    )}
                  </div>

                  <button
                    onClick={() => canRedeem && setRedeemingPerk(perk)}
                    disabled={!canRedeem}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isRedeemed ? (
                      <><CheckCircle className="w-4 h-4" /> Redeemed</>
                    ) : tierLocked ? (
                      <><Lock className="w-4 h-4" /> Unlock at {TIER_LABELS[reqTier!]}</>
                    ) : !canAfford ? (
                      <><Zap className="w-4 h-4" /> Not Enough Points</>
                    ) : perk.flash ? (
                      <><Clock className="w-4 h-4" /> Place Bid</>
                    ) : (
                      <><Gift className="w-4 h-4" /> Redeem Now</>
                    )}
                  </button>
                </div>
              </motion.div>
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

        {/* Legal */}
        <div className="sz-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-white/40" />
            <span className="text-white/50 text-sm font-semibold">PlayerPoints Terms & Conditions</span>
          </div>
          <ul className="space-y-2 mb-4">
            {DISCLAIMER_ITEMS.map((item, i) => (
              <li key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed">
                <span className="shrink-0 text-white/20">•</span>{item}
              </li>
            ))}
          </ul>
          <p className="text-white/30 text-xs border-t border-white/10 pt-4">
            For full terms, visit{' '}
            <a href="https://sandlotz.com/terms" target="_blank" rel="noopener noreferrer" className="text-yellow-400/60 hover:text-yellow-400 underline">sandlotz.com/terms</a>
            . Questions?{' '}
            <a href="mailto:support@sandlotz.com" className="text-yellow-400/60 hover:text-yellow-400 underline">support@sandlotz.com</a>
          </p>
        </div>
      </div>

      {/* Redemption Modal */}
      <AnimatePresence>
        {redeemingPerk && user && (
          <RedeemModal
            perk={redeemingPerk}
            uid={user.uid}
            onClose={() => setRedeemingPerk(null)}
            onConfirm={() => handleRedeem(redeemingPerk)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
