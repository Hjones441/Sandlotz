'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  getUserActivities, getPerks, getChallenges, joinChallenge, getChallengeParticipant,
  Activity,
} from '@/lib/firestore'
import type { Perk, Challenge } from '@/lib/firestore'
import { SPORT_OPTIONS, INTENSITY_LABELS, getRankTier, getTierProgress, formatScore } from '@/lib/sandlotzScore'
import {
  Zap, Clock, Ruler, Heart, Bookmark, ChevronRight, Bot,
  RefreshCw, Lightbulb, Bell, Star, Gift, Trophy, Flame,
  TrendingUp, Swords, ShoppingBag, Users, Lock, Loader2, X,
} from 'lucide-react'
import { ActivityCardSkeleton } from '@/components/ui/Skeleton'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function timeAgo(ts: { seconds: number } | undefined): string {
  if (!ts) return ''
  const d = Date.now() / 1000 - ts.seconds
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
}

function computeStreak(activities: Activity[]): number {
  if (activities.length === 0) return 0
  const dateSet = new Set<string>()
  activities.forEach(a => {
    const ts = a.createdAt as unknown as { seconds: number }
    if (ts?.seconds) {
      const d = new Date(ts.seconds * 1000)
      dateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    }
  })
  const sorted = Array.from(dateSet).sort().reverse()
  if (sorted.length === 0) return 0

  let streak = 1
  let prev = sorted[0].split('-').map(Number)
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i].split('-').map(Number)
    const prevDate = new Date(prev[0], prev[1], prev[2])
    const currDate = new Date(curr[0], curr[1], curr[2])
    const diff = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000)
    if (diff === 1) { streak++; prev = curr } else break
  }
  return streak
}

// ─── Mock community feed ──────────────────────────────────────────────────────

const FEED = [
  { id:'1', name:'Marcus R.',  av:'M', emoji:'🏃', action:'Morning 10k',      stats:'10km · 47min · 152bpm', pts:182, time:'4m',  likes:11 },
  { id:'2', name:'Sierra T.',  av:'S', emoji:'🏋️', action:'Leg Day PR',       stats:'60min · intensity 5',   pts:95,  time:'12m', likes:7  },
  { id:'3', name:'Devon K.',   av:'D', emoji:'🚴', action:'25mi Group Ride',  stats:'40km · 1h 38m · Garmin',pts:210, time:'38m', likes:14 },
  { id:'4', name:'Aisha W.',   av:'A', emoji:'🏊', action:'Masters Swim Set', stats:'2.0km · 52min · Whoop', pts:300, time:'1h',  likes:22 },
  { id:'5', name:'Jake M.',    av:'J', emoji:'⚡', action:'HIIT Bootcamp',    stats:'45min · 520 kcal',      pts:140, time:'2h',  likes:9  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function LikeBtn({ initial }: { initial: number }) {
  const [liked, setLiked] = useState(false)
  const [n, setN]         = useState(initial)
  return (
    <motion.button whileTap={{ scale: 0.8 }}
      onClick={() => { setLiked(l => !l); setN(c => liked ? c - 1 : c + 1) }}
      className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-red-400' : 'text-white/30'}`}>
      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} />
      {n}
    </motion.button>
  )
}

function SaveBtn() {
  const [saved, setSaved] = useState(false)
  return (
    <motion.button whileTap={{ scale: 0.8 }} onClick={() => setSaved(s => !s)}
      className={`transition-colors ${saved ? 'text-brand-yellow' : 'text-white/30'}`}>
      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-brand-yellow' : ''}`} />
    </motion.button>
  )
}

// ─── Perk Spotlight Card ──────────────────────────────────────────────────────

function PerkSpotlightCard({ perk, balance }: { perk: Perk; balance: number }) {
  const canAfford = balance >= perk.cost
  return (
    <Link href="/perks"
      className="flex-shrink-0 w-44 bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all">
      <div className="bg-gradient-to-br from-brand-yellow/15 to-brand-purple/30 h-20 flex items-center justify-center relative">
        <span className="text-4xl">{perk.emoji}</span>
        {perk.sponsored && (
          <span className="absolute top-2 left-2 bg-brand-yellow text-brand-purple-dark text-[9px] font-black px-1.5 py-0.5 rounded-full">
            SPONSOR
          </span>
        )}
        {perk.flash && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
            FLASH
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-white font-bold text-xs leading-tight line-clamp-2 mb-1.5">{perk.title}</p>
        <p className="text-white/40 text-[10px] mb-2">{perk.brand}</p>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${canAfford ? 'bg-brand-yellow/15' : 'bg-white/5'}`}>
          <Zap className={`w-2.5 h-2.5 ${canAfford ? 'text-brand-yellow' : 'text-white/30'}`} />
          <span className={`text-[10px] font-black ${canAfford ? 'text-brand-yellow' : 'text-white/30'}`}>
            {perk.cost.toLocaleString()} pts
          </span>
          {!canAfford && <Lock className="w-2.5 h-2.5 text-white/20 ml-auto" />}
        </div>
      </div>
    </Link>
  )
}

// ─── Challenge Card (real Firestore data) ─────────────────────────────────────

function LiveChallengeCard({ challenge, uid, displayName, photoURL }: {
  challenge: Challenge; uid: string; displayName: string; photoURL: string | null
}) {
  const [joined,    setJoined]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [checked,   setChecked]   = useState(false)

  useEffect(() => {
    if (!challenge.id) return
    getChallengeParticipant(challenge.id, uid).then(p => {
      setJoined(!!p)
      setChecked(true)
    })
  }, [challenge.id, uid])

  async function handleJoin() {
    if (!challenge.id || joined) return
    setLoading(true)
    try {
      await joinChallenge(challenge.id, uid, displayName, photoURL)
      setJoined(true)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const daysLeft = challenge.endDate
    ? Math.max(0, Math.ceil(((challenge.endDate as unknown as { seconds: number }).seconds * 1000 - Date.now()) / 86400000))
    : null

  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{challenge.emoji}</span>
          <div>
            <p className="font-bold text-sm">{challenge.title}</p>
            <p className="text-white/40 text-xs">{challenge.goal} {challenge.goalUnit}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 bg-brand-yellow/10 rounded-full px-2.5 py-1">
            <Star className="w-3 h-3 text-brand-yellow" />
            <span className="text-brand-yellow text-[10px] font-black">+{challenge.reward} PP</span>
          </div>
          {challenge.sponsored && (
            <span className="text-[9px] text-white/30">by {challenge.sponsorName}</span>
          )}
        </div>
      </div>
      <p className="text-white/40 text-xs mb-3 leading-relaxed line-clamp-2">{challenge.description}</p>
      <div className="flex items-center justify-between">
        {daysLeft !== null && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeft <= 2 ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-white/30'}`}>
            {daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}
          </span>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleJoin}
          disabled={joined || loading || !checked}
          className={`ml-auto py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            joined
              ? 'bg-white/5 border border-white/10 text-white/40'
              : 'bg-brand-yellow text-brand-purple-dark'
          }`}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {joined ? 'Joined ✓' : 'Join Challenge'}
        </motion.button>
      </div>
    </div>
  )
}

// ─── AI Coach Chat ─────────────────────────────────────────────────────────────

function AiCoachPanel({ acts, profile }: { acts: Activity[]; profile: { totalScore: number; displayName: string } | null }) {
  const [messages,  setMessages]  = useState<{ role: 'ai' | 'user'; text: string }[]>([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [open,      setOpen]      = useState(false)
  const [seeded,    setSeeded]    = useState(false)

  const tier = getRankTier(profile?.totalScore ?? 0).label

  const seedInsight = useCallback(async () => {
    if (seeded || !profile) return
    setSeeded(true)
    setLoading(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: acts.slice(0, 10), totalScore: profile.totalScore, tier }),
      })
      const d = await res.json()
      if (d.insight) {
        setMessages([
          { role: 'ai', text: d.insight },
          ...(d.tips?.map((t: string) => ({ role: 'ai' as const, text: `💡 ${t}` })) ?? []),
        ])
      }
    } catch { /* silent */ } finally { setLoading(false) }
  }, [seeded, profile, acts, tier])

  useEffect(() => {
    if (open && !seeded) seedInsight()
  }, [open, seeded, seedInsight])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: acts.slice(0, 10), totalScore: profile?.totalScore ?? 0, tier,
          question: userMsg,
        }),
      })
      const d = await res.json()
      setMessages(m => [...m, { role: 'ai', text: d.insight ?? d.answer ?? 'Keep pushing!' }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Connection issue — try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <motion.div layout className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03]">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="ai-coach-panel" aria-label="Toggle AI Coach" className="w-full flex items-center gap-3 p-3.5">
        <div className="w-8 h-8 rounded-xl bg-brand-yellow/15 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-brand-yellow" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider">AI Coach</p>
          <p className="text-xs text-white/50 truncate">
            {messages[0]?.text?.slice(0, 50) ?? 'Tap for personalized training insights'}
            {messages[0]?.text && messages[0].text.length > 50 ? '…' : ''}
          </p>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 text-white/20 transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div id="ai-coach-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-white/[0.06]">
            {/* Messages */}
            <div className="px-3.5 py-3 space-y-2 max-h-60 overflow-y-auto">
              {messages.length === 0 && !loading && (
                <p className="text-white/30 text-xs text-center py-4">
                  {acts.length === 0 ? 'Log your first workout to unlock AI insights.' : 'Loading your personalized insights…'}
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'ai' && (
                    <div className="w-5 h-5 rounded-full bg-brand-yellow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-brand-yellow" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'ai' ? 'bg-white/5 text-white/70' : 'bg-brand-yellow/20 text-brand-yellow'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand-yellow/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-brand-yellow" />
                  </div>
                  <div className="bg-white/5 rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Input */}
            <div className="flex gap-2 px-3.5 pb-3.5 pt-2 border-t border-white/[0.04]">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your coach anything…"
                className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-brand-yellow/30 transition-colors"
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="bg-brand-yellow text-brand-purple-dark rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40 transition-opacity">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'feed' | 'mine' | 'challenges'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [tab,        setTab]        = useState<Tab>('feed')
  const [acts,       setActs]       = useState<Activity[]>([])
  const [perks,      setPerks]      = useState<Perk[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [fetching,   setFetching]   = useState(true)

  useEffect(() => { if (!loading && !user) router.replace('/login') }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUserActivities(user.uid),
      getPerks(),
      getChallenges(),
    ]).then(([a, p, c]) => {
      setActs(a)
      setPerks(p.filter(pk => pk.available))
      setChallenges(c)
    }).catch(err => {
      console.error('[Dashboard] data fetch failed:', err)
    }).finally(() => {
      setFetching(false)
    })
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  const tier        = getRankTier(profile?.totalScore ?? 0)
  const tierProg    = getTierProgress(profile?.totalScore ?? 0)
  const name        = profile?.displayName?.split(' ')[0] ?? 'Athlete'
  const balance     = profile?.pointsBalance ?? profile?.totalScore ?? 0
  const totMins     = acts.reduce((s, a) => s + a.durationMinutes, 0)
  const totKm       = acts.reduce((s, a) => s + a.distanceKm, 0)
  const streak      = computeStreak(acts)

  // Featured perks: sponsored first, then by cost
  const featuredPerks = perks
    .filter(p => p.available)
    .sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0))
    .slice(0, 5)

  // Active challenges (not ended)
  const now = Date.now() / 1000
  const activeChallenges = challenges
    .filter(c => {
      const endSecs = (c.endDate as unknown as { seconds: number })?.seconds ?? 0
      return endSecs > now
    })
    .slice(0, 4)

  return (
    <div className="max-w-lg mx-auto">

      {/* ── Sticky App Header ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="px-4 pt-4 pb-0">

          {/* Score row */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] text-white/35 font-medium tracking-wide">{getGreeting()}, {name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black text-brand-yellow">{formatScore(profile?.totalScore ?? 0)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>{tier.label}</span>
              </div>
              <p className="text-[9px] text-white/20 font-medium tracking-wider mt-0.5">SANDLOTZ SCORE™</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Notifications" className="w-11 h-11 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow">
                <Bell className="w-4 h-4 text-white/40" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-yellow rounded-full" />
              </button>
              <Link href="/profile" aria-label="My profile" className="w-11 h-11 rounded-xl bg-brand-purple flex items-center justify-center font-black text-sm text-brand-yellow border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow">
                {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
              </Link>
            </div>
          </div>

          {/* PlayerPath™ tier bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[9px] text-white/25 mb-1">
              <span className="text-brand-yellow/50 font-bold tracking-wider">PLAYERPATH™ · {tier.label}</span>
              <span>{tierProg.pointsToNext > 0 ? `${tierProg.pointsToNext.toLocaleString()} to ${tierProg.nextLabel}` : 'Max Tier!'}</span>
            </div>
            <div className="h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tierProg.pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-yellow to-yellow-300"
              />
            </div>
          </div>

          {/* Streak + Balance pills */}
          <div className="flex gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5 flex-shrink-0">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-3 py-1.5 flex-shrink-0">
              <Zap className="w-3 h-3 text-brand-yellow" />
              <span className="text-xs font-bold text-brand-yellow">{balance.toLocaleString()} PP</span>
              <span className="text-[9px] text-white/30">to spend</span>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
            {[
              { icon: <Zap   className="w-3 h-3" />, v: String(acts.length),    l: 'Activities' },
              { icon: <Clock className="w-3 h-3" />, v: formatDuration(totMins), l: 'Active time' },
              { icon: <Ruler className="w-3 h-3" />, v: `${totKm.toFixed(0)}km`, l: 'Distance'   },
            ].map(s => (
              <div key={s.l} className="flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1.5 flex-shrink-0 border border-white/[0.06]">
                <span className="text-brand-yellow">{s.icon}</span>
                <span className="text-xs font-bold">{s.v}</span>
                <span className="text-[10px] text-white/30">{s.l}</span>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex">
            {([['feed','Community'],['mine','My Activity'],['challenges','Challenges']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-[11px] font-bold relative transition-colors ${tab===t?'text-brand-yellow':'text-white/30'}`}>
                {label}
                {tab === t && (
                  <motion.div layoutId="tabLine"
                    className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-brand-yellow rounded-full"
                    transition={{ type:'spring', stiffness:500, damping:35 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-4 pb-28">

        {/* ── SPONSOR REWARDS SPOTLIGHT ──────────────────────────────────── */}
        {featuredPerks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-yellow" />
                <span className="text-sm font-black text-white">Earn Real Rewards</span>
              </div>
              <Link href="/perks" className="flex items-center gap-1 text-xs text-brand-yellow font-bold hover:text-yellow-300 transition-colors">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {/* Balance CTA card */}
              <Link href="/perks"
                className="flex-shrink-0 w-36 bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/5 border border-brand-yellow/30 rounded-2xl p-3 flex flex-col justify-between min-h-[140px]">
                <div>
                  <Zap className="w-5 h-5 text-brand-yellow mb-1.5" />
                  <p className="text-brand-yellow font-black text-xl leading-none">{balance.toLocaleString()}</p>
                  <p className="text-brand-yellow/60 text-[9px] font-bold uppercase tracking-wide mt-0.5">PlayerPoints</p>
                </div>
                <p className="text-brand-yellow text-[10px] font-bold mt-3">Browse Rewards →</p>
              </Link>
              {featuredPerks.map(p => (
                <PerkSpotlightCard key={p.id} perk={p} balance={balance} />
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/log-activity',  icon: <Zap className="w-5 h-5" />,         label: 'Log Activity',   color: 'bg-brand-yellow/15 border-brand-yellow/25 text-brand-yellow',  glow: true },
            { href: '/perks',         icon: <Gift className="w-5 h-5" />,         label: 'Redeem Perks',   color: 'bg-white/5 border-white/[0.08] text-white/60',                 glow: false },
            { href: '/leaderboard',   icon: <Trophy className="w-5 h-5" />,       label: 'Leaderboard',    color: 'bg-white/5 border-white/[0.08] text-white/60',                 glow: false },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-4 transition-all hover:scale-[1.02] ${a.color}`}>
              {a.icon}
              <span className="text-[10px] font-bold text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* ── AI Coach ────────────────────────────────────────────────────── */}
        <AiCoachPanel acts={acts} profile={profile} />

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* COMMUNITY FEED */}
          {tab === 'feed' && (
            <motion.div key="feed" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Users className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/30">Community Activity</span>
                <span className="ml-auto text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full">Preview</span>
              </div>
              {FEED.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-purple border border-white/10 flex items-center justify-center font-black text-sm text-brand-yellow flex-shrink-0">
                      {item.av}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <p className="font-bold text-sm">{item.name}</p>
                        <span className="text-[10px] text-white/25 ml-2">{item.time} ago</span>
                      </div>
                      <p className="text-sm text-white/80 mt-0.5">{item.emoji} {item.action}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{item.stats}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <LikeBtn initial={item.likes} />
                      <SaveBtn />
                    </div>
                    <div className="flex items-center gap-1 bg-brand-yellow/10 rounded-full px-2.5 py-1">
                      <Zap className="w-3 h-3 text-brand-yellow" />
                      <span className="text-brand-yellow text-[11px] font-black">+{item.pts}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <p className="text-center text-white/15 text-xs py-4">All caught up · Invite friends to grow the feed</p>
            </motion.div>
          )}

          {/* MY ACTIVITY */}
          {tab === 'mine' && (
            <motion.div key="mine" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
              {fetching ? (
                <div className="space-y-3">{[0,1,2].map(i => <ActivityCardSkeleton key={i} />)}</div>
              ) : acts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🏃</div>
                  <p className="text-white/40 font-semibold mb-1">No activities yet</p>
                  <p className="text-white/20 text-sm mb-6">Tap + to log your first workout and start earning</p>
                  <Link href="/log-activity" className="btn-primary inline-block">Log First Activity</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {acts.slice(0, 20).map((a, i) => {
                    const sp = SPORT_OPTIONS.find(s => s.value === a.sport)
                    return (
                      <motion.div key={a.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                        className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                          {sp?.emoji ?? '🏅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm capitalize">{a.sport}</p>
                          <p className="text-white/35 text-[11px]">
                            {formatDuration(a.durationMinutes)}{a.distanceKm > 0 ? ` · ${a.distanceKm}km` : ''} · {INTENSITY_LABELS[a.intensity]}
                          </p>
                          {a.fitnessData?.source && a.fitnessData.source !== 'Manual' && (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-green-400/70 bg-green-400/8 rounded-full px-2 py-0.5">✓ {a.fitnessData.source}</span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-brand-yellow text-sm">+{a.score}</p>
                          <p className="text-white/20 text-[10px]">{timeAgo(a.createdAt as unknown as { seconds: number })}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                  <Link href="/profile" className="flex items-center justify-center gap-1.5 py-4 text-xs text-white/25 hover:text-white/50 transition-colors">
                    View full history <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* CHALLENGES (Live Firestore) */}
          {tab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="space-y-3">
              {fetching ? (
                <div className="space-y-3">{[0,1,2].map(i => <ActivityCardSkeleton key={i} />)}</div>
              ) : activeChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <Swords className="w-10 h-10 mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm mb-1">No active challenges right now</p>
                  <p className="text-white/20 text-xs mb-4">New challenges drop every Monday — check back soon</p>
                  <Link href="/perks" className="inline-flex items-center gap-1.5 text-xs text-brand-yellow font-bold hover:underline">
                    Browse Perks instead <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                activeChallenges.map(c => (
                  <LiveChallengeCard
                    key={c.id}
                    challenge={c}
                    uid={user.uid}
                    displayName={profile?.displayName ?? 'Athlete'}
                    photoURL={null}
                  />
                ))
              )}

              {/* Perks CTA */}
              <Link href="/perks"
                className="flex items-center gap-3 p-4 rounded-2xl border border-brand-yellow/20 bg-brand-yellow/5 hover:bg-brand-yellow/10 transition-all">
                <Gift className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Redeem Your Points</p>
                  <p className="text-xs text-white/40">You have <span className="text-brand-yellow font-bold">{balance.toLocaleString()} PP</span> to spend on sponsor rewards</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </Link>

              <Link href="/challenges" className="flex items-center justify-center gap-1.5 w-full py-4 rounded-2xl border border-white/[0.06] text-xs text-white/25 hover:text-white/50 transition-colors">
                Browse all challenges <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}

        </AnimatePresence>

        {/* How to earn more CTA */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-white/40" />
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider">How PlayerPoints Work</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { emoji: '📲', label: 'Log Workout', sub: 'Any sport counts' },
              { emoji: '⚡', label: 'Earn PP',     sub: 'Scored by effort' },
              { emoji: '🎁', label: 'Redeem',      sub: 'Real brand rewards' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <p className="text-white/60 text-[11px] font-bold">{s.label}</p>
                <p className="text-white/25 text-[10px]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
