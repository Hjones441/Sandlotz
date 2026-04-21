'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  getUserActivities, getUserRedemptions, getPerks,
  Activity, Redemption,
} from '@/lib/firestore'
import type { Perk } from '@/lib/firestore'
import { getRankTier, getTierProgress, SPORT_OPTIONS, INTENSITY_LABELS, formatScore, TIER_THRESHOLDS } from '@/lib/sandlotzScore'
import AppHeader from '@/components/layout/AppHeader'
import {
  Zap, Flame, Trophy, Star, Gift, TrendingUp, Activity as ActivityIcon,
  Clock, Ruler, MapPin, Share2, Settings, LogOut, ChevronRight,
  CheckCircle2, Lock, Bot, Loader2, Target, ShoppingBag,
} from 'lucide-react'

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
    const diff = Math.round(
      (new Date(prev[0], prev[1], prev[2]).getTime() - new Date(curr[0], curr[1], curr[2]).getTime()) / 86400000
    )
    if (diff === 1) { streak++; prev = curr } else break
  }
  return streak
}

function getUniqueSports(activities: Activity[]): string[] {
  return Array.from(new Set(activities.map(a => a.sport)))
}

// ─── Achievements engine ──────────────────────────────────────────────────────

interface Achievement {
  id:       string
  emoji:    string
  title:    string
  desc:     string
  unlocked: boolean
  xp:       number
}

function computeAchievements(acts: Activity[], streak: number): Achievement[] {
  const totalKm   = acts.reduce((s, a) => s + a.distanceKm, 0)
  const totalMins = acts.reduce((s, a) => s + a.durationMinutes, 0)
  const sports    = getUniqueSports(acts)
  const verified  = acts.filter(a => a.fitnessData?.source && a.fitnessData.source !== 'Manual').length

  return [
    {
      id: 'first',    emoji: '🚀', title: 'First Step',        xp: 50,
      desc: 'Log your first workout',
      unlocked: acts.length >= 1,
    },
    {
      id: 'five',     emoji: '🔥', title: 'Getting Warmed Up', xp: 100,
      desc: 'Log 5 activities',
      unlocked: acts.length >= 5,
    },
    {
      id: 'ten',      emoji: '💪', title: 'Double Digits',     xp: 200,
      desc: 'Log 10 activities',
      unlocked: acts.length >= 10,
    },
    {
      id: 'twenty',   emoji: '⚡', title: 'Grinder',           xp: 300,
      desc: 'Log 20 activities',
      unlocked: acts.length >= 20,
    },
    {
      id: 'fifty',    emoji: '🏆', title: 'True Athlete',      xp: 500,
      desc: 'Log 50 activities',
      unlocked: acts.length >= 50,
    },
    {
      id: 'streak3',  emoji: '🌤️', title: '3-Day Streak',     xp: 75,
      desc: 'Work out 3 days in a row',
      unlocked: streak >= 3,
    },
    {
      id: 'streak7',  emoji: '🔥', title: 'Week Warrior',      xp: 150,
      desc: 'Log activities 7 days in a row',
      unlocked: streak >= 7,
    },
    {
      id: 'streak30', emoji: '🦁', title: 'Iron Will',         xp: 600,
      desc: '30-day streak — extraordinary',
      unlocked: streak >= 30,
    },
    {
      id: 'dist50',   emoji: '🗺️', title: 'Distance Chaser',  xp: 200,
      desc: 'Cover 50 km across all activities',
      unlocked: totalKm >= 50,
    },
    {
      id: 'dist100',  emoji: '🌍', title: 'Century Club',      xp: 400,
      desc: 'Cover 100 km across all activities',
      unlocked: totalKm >= 100,
    },
    {
      id: 'time10h',  emoji: '⏱️', title: '10-Hour Club',      xp: 250,
      desc: 'Accumulate 10 hours of exercise',
      unlocked: totalMins >= 600,
    },
    {
      id: 'multisport',emoji: '🎯', title: 'Multi-Sport',      xp: 150,
      desc: 'Try 3 different sports',
      unlocked: sports.length >= 3,
    },
    {
      id: 'verified', emoji: '✅', title: 'Verified Athlete',  xp: 100,
      desc: 'Connect a device (Strava, Garmin, etc.)',
      unlocked: verified >= 1,
    },
    {
      id: 'sweat500', emoji: '💰', title: 'Point Earner',      xp: 100,
      desc: 'Earn 500+ Sandlotz Score points',
      unlocked: acts.reduce((s, a) => s + a.score, 0) >= 500,
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, profile, loading, logOut } = useAuth()
  const router = useRouter()

  const [acts,        setActs]        = useState<Activity[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [perks,       setPerks]       = useState<Perk[]>([])
  const [fetching,    setFetching]    = useState(true)
  const [shareMsg,    setShareMsg]    = useState('')
  const [aiInsight,   setAiInsight]   = useState<string | null>(null)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [showAllAch,  setShowAllAch]  = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUserActivities(user.uid),
      getUserRedemptions(user.uid),
      getPerks(),
    ]).then(([a, r, p]) => {
      setActs(a)
      setRedemptions(r)
      setPerks(p.filter(pk => pk.available))
    }).catch(err => {
      console.error('[Profile] data fetch failed:', err)
    }).finally(() => {
      setFetching(false)
    })
  }, [user])

  const fetchAI = useCallback(async () => {
    if (!profile || aiInsight !== null || acts.length === 0) return
    setAiLoading(true)
    try {
      const tier = getRankTier(profile.totalScore).label
      const res = await fetch('/api/ai-coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: acts.slice(0, 10), totalScore: profile.totalScore, tier }),
      })
      const d = await res.json()
      if (d.insight) setAiInsight(d.insight)
    } catch { /* silent */ } finally { setAiLoading(false) }
  }, [profile, aiInsight, acts])

  useEffect(() => {
    if (!fetching) fetchAI()
  }, [fetching, fetchAI])

  function handleShare() {
    const url = 'https://app.sandlotz.com/leaderboard'
    if (navigator.share) {
      navigator.share({ title: `My Sandlotz Profile — ${formatScore(profile?.totalScore ?? 0)} pts`, url })
    } else {
      navigator.clipboard.writeText(url)
      setShareMsg('Link copied!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  // Derived data
  const tier          = getRankTier(profile.totalScore)
  const tierProg      = getTierProgress(profile.totalScore)
  const balance       = profile.pointsBalance ?? profile.totalScore ?? 0
  const initials      = profile.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const totalKm       = acts.reduce((s, a) => s + a.distanceKm, 0)
  const totalMins     = acts.reduce((s, a) => s + a.durationMinutes, 0)
  const streak        = computeStreak(acts)
  const uniqueSports  = getUniqueSports(acts)
  const achievements  = computeAchievements(acts, streak)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  // Top sport by count
  const sportCounts: Record<string, number> = {}
  acts.forEach(a => { sportCounts[a.sport] = (sportCounts[a.sport] ?? 0) + 1 })
  const topSportKey = Object.entries(sportCounts).sort((a,b) => b[1]-a[1])[0]?.[0]
  const topSportOpt = SPORT_OPTIONS.find(s => s.value === topSportKey)

  // Featured perks: top sponsored + affordable first
  const featuredPerks = perks
    .sort((a, b) => {
      const aScore = (a.sponsored ? 2 : 0) + (balance >= a.cost ? 1 : 0)
      const bScore = (b.sponsored ? 2 : 0) + (balance >= b.cost ? 1 : 0)
      return bScore - aScore
    })
    .slice(0, 4)

  const displayedAch = showAllAch ? achievements : achievements.slice(0, 6)

  return (
    <div className="max-w-4xl mx-auto pb-4">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader
          title="Profile"
          subtitle={`@${profile.displayName}`}
          right={
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="w-8 h-8 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center relative">
                <Share2 className="w-4 h-4 text-white/50" />
                {shareMsg && (
                  <span className="absolute -bottom-6 right-0 text-[10px] text-green-400 whitespace-nowrap font-bold">
                    {shareMsg}
                  </span>
                )}
              </button>
            </div>
          }
        />
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── HERO CARD ──────────────────────────────────────────────────── */}
        <div className="sz-card p-5 relative overflow-hidden">
          {/* Background tier glow */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 ${tier.color.replace('text-', 'bg-')}`} />

          {/* Top-right actions */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <Link href="/settings" className="text-white/40 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </Link>
            <button onClick={() => logOut()} className="text-white/40 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-4 relative">
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shrink-0 ${tier.badgeClass.includes('yellow') ? 'bg-brand-yellow/20 border-brand-yellow/40' : 'bg-white/10 border-white/20'}`}>
              <span className={`font-black text-2xl ${tier.color}`}>{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{profile.displayName}</h1>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeClass}`}>
                  {tier.label} Tier
                </span>
                {profile.city && (
                  <span className="flex items-center gap-1 text-white/40 text-xs">
                    <MapPin className="w-3 h-3" />
                    {profile.city}
                  </span>
                )}
              </div>
              {uniqueSports.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {uniqueSports.slice(0, 4).map(s => {
                    const opt = SPORT_OPTIONS.find(o => o.value === s)
                    return opt ? (
                      <span key={s} className="text-[10px] bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">
                        {opt.emoji} {opt.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Score / Balance row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl p-3 text-center">
              <Zap className="w-4 h-4 text-brand-yellow mx-auto mb-1" />
              <p className="text-2xl font-black text-brand-yellow">{formatScore(profile.totalScore)}</p>
              <p className="text-white/40 text-[10px] mt-0.5">Sandlotz Score™</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <Gift className="w-4 h-4 text-white/50 mx-auto mb-1" />
              <p className="text-2xl font-black text-white">{balance.toLocaleString()}</p>
              <p className="text-white/40 text-[10px] mt-0.5">PlayerPoints</p>
            </div>
          </div>

          {/* XP Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-white/35 mb-1.5">
              <span className="text-brand-yellow/60 font-bold tracking-wider">PLAYERPATH™ · {tier.label}</span>
              <span>{tierProg.pointsToNext > 0 ? `${tierProg.pointsToNext.toLocaleString()} pts → ${tierProg.nextLabel}` : 'Max Tier!'}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tierProg.pct}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-yellow to-yellow-300"
              />
            </div>
            <div className="flex justify-between text-[9px] text-white/20 mt-1.5">
              {TIER_THRESHOLDS.slice().reverse().map(t => (
                <span key={t.label} className={profile.totalScore >= t.min ? t.color : 'text-white/15'}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <ActivityIcon className="w-4 h-4" />, v: String(acts.length),       l: 'Activities', color: 'text-brand-yellow' },
            { icon: <Ruler className="w-4 h-4" />,        v: `${totalKm.toFixed(1)}km`, l: 'Distance',   color: 'text-blue-400'    },
            { icon: <Clock className="w-4 h-4" />,        v: formatDuration(totalMins), l: 'Active',     color: 'text-green-400'   },
            { icon: <Flame className="w-4 h-4" />,        v: `${streak}d`,              l: 'Streak',     color: 'text-orange-400'  },
          ].map(s => (
            <div key={s.l} className="sz-card p-3 text-center">
              <span className={s.color}>{s.icon}</span>
              <p className="font-black text-white text-lg mt-1">{s.v}</p>
              <p className="text-white/35 text-[10px]">{s.l}</p>
            </div>
          ))}
        </div>

        {/* ── REWARDS & PERKS ───────────────────────────────────────────── */}
        <div className="sz-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-brand-yellow" />
              <span className="font-bold text-white">Sponsor Rewards</span>
            </div>
            <Link href="/perks" className="text-xs text-brand-yellow font-bold hover:text-yellow-300 transition-colors flex items-center gap-1">
              Browse All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Balance callout */}
          <div className="bg-brand-yellow/8 border border-brand-yellow/20 rounded-xl p-3 mb-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-brand-yellow flex-shrink-0" />
            <div className="flex-1">
              <p className="text-brand-yellow font-black text-lg leading-none">{balance.toLocaleString()} PP</p>
              <p className="text-white/40 text-xs">Available to redeem</p>
            </div>
            <Link href="/perks" className="bg-brand-yellow text-brand-purple-dark text-xs font-black px-3 py-1.5 rounded-xl flex-shrink-0">
              Redeem
            </Link>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-white/30" />
            </div>
          ) : featuredPerks.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-4">No perks available yet — check back soon!</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featuredPerks.map(perk => {
                const canAfford = balance >= perk.cost
                return (
                  <Link key={perk.id} href="/perks"
                    className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden hover:border-brand-yellow/30 transition-all group">
                    <div className="bg-gradient-to-br from-white/10 to-transparent h-14 flex items-center justify-center relative">
                      <span className="text-3xl">{perk.emoji}</span>
                      {perk.sponsored && (
                        <span className="absolute top-1.5 left-1.5 bg-brand-yellow text-brand-purple-dark text-[8px] font-black px-1.5 py-0.5 rounded-full">SPONSOR</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-white text-xs font-bold leading-tight line-clamp-1">{perk.title}</p>
                      <p className="text-white/30 text-[10px] mb-1.5">{perk.brand}</p>
                      <div className={`flex items-center gap-1 text-[10px] font-black rounded-full px-2 py-0.5 w-fit ${canAfford ? 'bg-brand-yellow/15 text-brand-yellow' : 'bg-white/5 text-white/30'}`}>
                        <Zap className="w-2.5 h-2.5" />
                        {perk.cost.toLocaleString()} pts
                        {!canAfford && <Lock className="w-2.5 h-2.5 ml-0.5" />}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {redemptions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Recent Redemptions</p>
              <div className="space-y-2">
                {redemptions.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
                    <span className="text-xl">{r.perkEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{r.perkTitle}</p>
                      <p className="text-white/30 text-[10px]">Code: <span className="text-brand-yellow font-mono">{r.code}</span></p>
                    </div>
                    <span className="text-[10px] text-white/25">-{r.cost.toLocaleString()} PP</span>
                  </div>
                ))}
                {redemptions.length > 3 && (
                  <Link href="/perks" className="block text-center text-xs text-white/25 hover:text-white/50 transition-colors py-1">
                    +{redemptions.length - 3} more redemptions
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── ACHIEVEMENTS ─────────────────────────────────────────────── */}
        <div className="sz-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-yellow" />
              <span className="font-bold text-white">Achievements</span>
            </div>
            <span className="text-xs text-white/40 font-semibold">{unlockedCount}/{achievements.length} unlocked</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {displayedAch.map(ach => (
              <div key={ach.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                  ach.unlocked
                    ? 'bg-white/[0.04] border-white/[0.08]'
                    : 'bg-white/[0.02] border-white/[0.04] opacity-50'
                }`}>
                <span className={`text-xl ${!ach.unlocked ? 'grayscale opacity-40' : ''}`}>{ach.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold leading-tight">{ach.title}</p>
                  <p className="text-white/35 text-[10px] leading-tight mt-0.5">{ach.desc}</p>
                  {ach.unlocked ? (
                    <span className="text-[9px] text-green-400 font-bold flex items-center gap-0.5 mt-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> +{ach.xp} XP
                    </span>
                  ) : (
                    <span className="text-[9px] text-white/20 flex items-center gap-0.5 mt-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {achievements.length > 6 && (
            <button onClick={() => setShowAllAch(v => !v)}
              className="w-full mt-3 py-2.5 text-xs text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1.5">
              {showAllAch ? 'Show Less' : `Show All ${achievements.length} Achievements`}
              <ChevronRight className={`w-3 h-3 transition-transform ${showAllAch ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        {/* ── RECENT ACTIVITY ──────────────────────────────────────────── */}
        <div className="sz-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-white/50" />
              <span className="font-bold text-white">Recent Activity</span>
            </div>
            {topSportOpt && (
              <span className="text-xs text-white/40">
                Top sport: <span className="text-white font-bold">{topSportOpt.emoji} {topSportOpt.label}</span>
              </span>
            )}
          </div>

          {fetching ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-white/30" />
            </div>
          ) : acts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm mb-3">No activities logged yet</p>
              <Link href="/log-activity" className="btn-primary inline-block text-sm">Log First Workout</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {acts.slice(0, 5).map((a, i) => {
                const sp = SPORT_OPTIONS.find(s => s.value === a.sport)
                return (
                  <motion.div key={a.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                      {sp?.emoji ?? '🏅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm capitalize text-white">{a.sport}</p>
                      <p className="text-white/35 text-[11px]">
                        {formatDuration(a.durationMinutes)}
                        {a.distanceKm > 0 ? ` · ${a.distanceKm}km` : ''}
                        {' · '}{INTENSITY_LABELS[a.intensity]}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-brand-yellow font-black text-sm">+{a.score}</p>
                      <p className="text-white/20 text-[10px]">{timeAgo(a.createdAt as unknown as { seconds: number })}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── AI DIGEST ────────────────────────────────────────────────── */}
        <div className="sz-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-brand-yellow" />
            <span className="font-bold text-white">AI Performance Digest</span>
          </div>
          <p className="text-white/30 text-[10px] mb-3">Personalized training insights from your activity data. Not medical advice.</p>

          {aiLoading ? (
            <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-4">
              <Loader2 className="w-4 h-4 animate-spin text-brand-yellow/60 flex-shrink-0" />
              <p className="text-white/40 text-xs">Analyzing your training patterns…</p>
            </div>
          ) : aiInsight ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
              <p className="text-white/70 text-sm leading-relaxed">{aiInsight}</p>
            </div>
          ) : acts.length === 0 ? (
            <div className="bg-white/[0.02] rounded-xl p-4 text-center">
              <p className="text-white/30 text-sm">Log your first workout to receive personalized AI insights.</p>
              <Link href="/log-activity" className="mt-3 inline-block text-brand-yellow text-xs font-bold hover:underline">
                Log Activity →
              </Link>
            </div>
          ) : null}
        </div>

        {/* ── PLAYER RANKING ───────────────────────────────────────────── */}
        <div className="sz-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-brand-yellow" />
            <span className="font-bold text-white">My Ranking</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TIER_THRESHOLDS.slice().reverse().map(t => {
              const isCurrentTier = tier.label === t.label
              return (
                <div key={t.label} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                  isCurrentTier ? `border-current ${t.badgeClass}` : 'border-white/[0.05] bg-white/[0.02] opacity-40'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${isCurrentTier ? t.color : 'text-white/20'}`} />
                  <div>
                    <p className={`text-sm font-black ${isCurrentTier ? t.color : 'text-white/30'}`}>{t.label}</p>
                    <p className="text-white/25 text-[10px]">{t.min.toLocaleString()}+ pts</p>
                  </div>
                  {isCurrentTier && <CheckCircle2 className={`w-3.5 h-3.5 ml-auto ${t.color}`} />}
                </div>
              )
            })}
          </div>
          <Link href="/leaderboard" className="btn-ghost w-full text-sm text-center block">
            View City Leaderboard
          </Link>
        </div>

        {/* ── QUICK LINKS ───────────────────────────────────────────────── */}
        <div className="sz-card divide-y divide-white/[0.05]">
          {[
            { href: '/log-activity', icon: <Zap className="w-4 h-4" />,     label: 'Log a Workout',       sub: 'Earn PlayerPoints now'                    },
            { href: '/challenges',   icon: <Target className="w-4 h-4" />,  label: 'Challenges',          sub: 'Compete for bonus rewards'                },
            { href: '/marketplace',  icon: <ShoppingBag className="w-4 h-4" />, label: 'Sponsor Marketplace', sub: 'Redeem with brand partners'          },
            { href: '/perks',        icon: <Gift className="w-4 h-4" />,    label: 'Perks Store',         sub: `${balance.toLocaleString()} PlayerPoints` },
            { href: '/upgrade',      icon: <Star className="w-4 h-4" />,    label: 'PlayerPath™ Plans',   sub: 'Rookie · All-Star · Legend'               },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors">
              <span className="text-brand-yellow">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-white/35">{item.sub}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}

