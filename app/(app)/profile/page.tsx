'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getRankTier, getTierProgress, SPORT_OPTIONS, formatScore } from '@/lib/sandlotzScore'
import { getUserActivities } from '@/lib/firestore'
import type { Activity } from '@/lib/firestore'
import NextLink from 'next/link'
import AppHeader from '@/components/layout/AppHeader'
import {
  Activity as ActivityIcon,
  Trophy,
  Star,
  Zap,
  Bot,
  Lightbulb,
  RefreshCw,
  Medal,
  Flame,
  TrendingUp,
  ShoppingCart,
  Gift,
  Target,
  Share2,
  Settings,
  LogOut,
  ExternalLink,
  Wind,
  HeartPulse,
  MapPin,
} from 'lucide-react'

type QuestTab = 'Daily' | 'Weekly' | 'Monthly'

const BAR_DAYS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa']

function toMs(a: Activity): number {
  const ts = a.createdAt as any
  return ts?.seconds ? ts.seconds * 1000 : 0
}

function calcLongestStreak(acts: Activity[]): number {
  if (!acts.length) return 0
  const days = Array.from(new Set(acts.map(a => {
    const d = new Date(toMs(a)); d.setHours(0, 0, 0, 0); return d.getTime()
  }))).sort((a, b) => a - b)
  let longest = 1, cur = 1
  for (let i = 1; i < days.length; i++) {
    cur = days[i] - days[i - 1] === 86400000 ? cur + 1 : 1
    longest = Math.max(longest, cur)
  }
  return longest
}

function calcWeekBars(acts: Activity[]): number[] {
  const now = new Date()
  const sun = new Date(now)
  sun.setDate(now.getDate() - now.getDay())
  sun.setHours(0, 0, 0, 0)
  const byDay = [0, 0, 0, 0, 0, 0, 0]
  acts.forEach(a => {
    const d = new Date(toMs(a))
    if (d >= sun) byDay[d.getDay()] += a.score
  })
  const mx = Math.max(...byDay, 1)
  return byDay.map(s => Math.max(4, Math.round((s / mx) * 100)))
}

export default function ProfilePage() {
  const { user, profile, loading, logOut } = useAuth()
  const router = useRouter()
  const [questTab, setQuestTab] = useState<QuestTab>('Daily')
  const [shareMsg, setShareMsg] = useState('')
  const [activities,  setActivities]  = useState<Activity[]>([])
  const [actsLoading, setActsLoading] = useState(true)
  const [aiInsight,   setAiInsight]   = useState<string | null>(null)
  const [aiTips,      setAiTips]      = useState<string[]>([])
  const [aiLoading,   setAiLoading]   = useState(false)

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'My Sandlotz Profile', url })
    } else {
      navigator.clipboard.writeText(url)
      setShareMsg('Link copied!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUserActivities(user.uid).then(acts => {
      setActivities(acts)
      setActsLoading(false)
      if (acts.length > 0 && profile) {
        setAiLoading(true)
        fetch('/api/ai-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activities: acts.slice(0, 10),
            totalScore: profile.totalScore,
            tier: getRankTier(profile.totalScore).label,
          }),
        })
          .then(r => r.json())
          .then(d => { if (d.insight) { setAiInsight(d.insight); setAiTips(d.tips ?? []) } })
          .catch(() => {})
          .finally(() => setAiLoading(false))
      }
    }).catch(() => setActsLoading(false))
  }, [user, profile])

  const { weekBarHeights, currentStreak, longestStreak, maxCalAct, activeSports, quests, avgHR, totalCalories, recentVerified } = useMemo(() => {
    const now = new Date()
    const weekBarHeights = calcWeekBars(activities)

    const todayMs = new Date().setHours(0, 0, 0, 0)
    const daySet = new Set(activities.map(a => {
      const d = new Date(toMs(a)); d.setHours(0, 0, 0, 0); return d.getTime()
    }))
    let currentStreak = 0
    let check = todayMs
    if (!daySet.has(check)) check = todayMs - 86400000
    while (daySet.has(check)) { currentStreak++; check -= 86400000 }

    const longestStreak = calcLongestStreak(activities)

    const maxCalAct = activities.reduce<Activity | null>((best, a) => {
      const cal = a.fitnessData?.calories ?? 0
      return cal > (best?.fitnessData?.calories ?? 0) ? a : best
    }, null)

    const seen = new Set<string>()
    const activeSports: string[] = []
    for (const a of activities) {
      if (!seen.has(a.sport)) { seen.add(a.sport); activeSports.push(a.sport) }
    }

    const sunStart = new Date(now)
    sunStart.setDate(now.getDate() - now.getDay())
    sunStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const weekActs  = activities.filter(a => new Date(toMs(a)) >= sunStart)
    const monthActs = activities.filter(a => new Date(toMs(a)) >= monthStart)
    const todayActs = activities.filter(a => new Date(toMs(a)) >= todayStart)

    const weekCount      = weekActs.length
    const weekDistKm     = weekActs.filter(a => a.sport === 'running' || a.sport === 'cycling').reduce((s, a) => s + a.distanceKm, 0)
    const monthDays      = new Set(monthActs.map(a => { const d = new Date(toMs(a)); d.setHours(0,0,0,0); return d.getTime() })).size
    const monthSportCount = new Set(monthActs.map(a => a.sport)).size
    const loggedToday    = todayActs.length > 0
    const todayCal       = todayActs.reduce((s, a) => s + (a.fitnessData?.calories ?? 0), 0)

    const quests = {
      Daily: [
        { title: 'Daily Logger', desc: 'Log any activity today', pp: 25, done: loggedToday },
        { title: 'Calorie Burn', desc: 'Burn at least 500 calories today', pp: 50, done: todayCal >= 500, inProgress: todayCal > 0 && todayCal < 500, progress: todayCal > 0 ? [Math.min(todayCal, 500), 500] as [number, number] : undefined },
      ],
      Weekly: [
        { title: 'Weekend Warrior', desc: 'Log 3 activities this week', pp: 75, done: weekCount >= 3, inProgress: weekCount > 0 && weekCount < 3, progress: [Math.min(weekCount, 3), 3] as [number, number] },
        { title: 'Distance Chaser', desc: 'Run or cycle 20 km this week', pp: 100, done: weekDistKm >= 20, inProgress: weekDistKm > 0 && weekDistKm < 20, progress: [+Math.min(weekDistKm, 20).toFixed(1), 20] as [number, number] },
      ],
      Monthly: [
        { title: 'Consistency King', desc: 'Log an activity 15 days this month', pp: 200, done: monthDays >= 15, inProgress: monthDays > 0 && monthDays < 15, progress: [Math.min(monthDays, 15), 15] as [number, number] },
        { title: 'Sport Sampler', desc: 'Try 3 different sports this month', pp: 150, done: monthSportCount >= 3, inProgress: monthSportCount > 0 && monthSportCount < 3, progress: [Math.min(monthSportCount, 3), 3] as [number, number] },
      ],
    }

    const recentVerified = activities.find(a => a.fitnessData?.source && a.fitnessData.source !== 'Manual')
    const avgHR          = recentVerified?.fitnessData?.heartRateAvg ?? null
    const totalCalories  = activities.reduce((s, a) => s + (a.fitnessData?.calories ?? 0), 0)

    return { weekBarHeights, currentStreak, longestStreak, maxCalAct, activeSports, quests, avgHR, totalCalories, recentVerified }
  }, [activities])

  const badges = useMemo(() => [
    {
      icon: <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />,
      title: '7-Day Streak',
      desc: 'Logged an activity every day for a week.',
      earned: longestStreak >= 7,
    },
    {
      icon: <Medal className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />,
      title: 'Marathon Finisher',
      desc: 'Logged a run of 42.2 km or more.',
      earned: activities.some(a => a.sport === 'running' && a.distanceKm >= 42.2),
    },
    {
      icon: <Trophy className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />,
      title: 'Top Performer',
      desc: 'Reached All-Star tier (500+ PlayerPoints).',
      earned: (profile?.totalScore ?? 0) >= 500,
    },
  ], [activities, longestStreak, profile?.totalScore])

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  const tier        = getRankTier(profile.totalScore)
  const initials    = profile.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const { pct: progress, nextLabel: nextTier, pointsToNext } = getTierProgress(profile.totalScore)
  const sportLabel  = SPORT_OPTIONS.find(s => s.value === profile.sport)?.label ?? 'Other'
  const sportEmoji  = SPORT_OPTIONS.find(s => s.value === profile.sport)?.emoji ?? '🏅'

  return (
    <div className="max-w-4xl mx-auto pb-4">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader
          title="Profile"
          subtitle={`@${profile.displayName}`}
          right={
            <button onClick={handleShare} className="w-8 h-8 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white/50" />
            </button>
          }
        />
      </div>

      <div className="px-4 pt-4">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT COLUMN (60%) ─────────────────────────────────────── */}
          <div className="lg:w-[60%] space-y-4">

            {/* Profile card */}
            <div className="sz-card p-6 relative">
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <button onClick={handleShare} title={shareMsg || 'Share profile'} className="text-white/50 hover:text-white transition-colors relative">
                  <Share2 className="w-5 h-5" />
                  {shareMsg && <span className="absolute -bottom-6 -right-2 text-xs text-green-400 whitespace-nowrap">{shareMsg}</span>}
                </button>
                <NextLink href="/settings" title="Settings" className="text-white/50 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </NextLink>
                <button onClick={() => logOut()} title="Sign out" className="text-white/50 hover:text-white transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-2xl">{initials}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-black text-white">{profile.displayName}</h1>
                    <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full">
                      {tier.label.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.city || 'Unknown City'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{formatScore(profile.totalScore)}</p>
                  <p className="text-white/50 text-xs mt-0.5">SweatScore</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{currentStreak}</p>
                  <p className="text-white/50 text-xs mt-0.5">Day Streak 🔥</p>
                </div>
              </div>

              <p className="text-white/70 text-sm mb-4">
                {(profile as any).bio || 'No bio yet — add one in Settings.'}
              </p>

              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">My Sports</p>
                <div className="flex flex-wrap gap-2">
                  {activeSports.length > 0
                    ? activeSports.slice(0, 4).map(s => {
                        const opt = SPORT_OPTIONS.find(o => o.value === s)
                        return (
                          <span key={s} className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">
                            {opt?.emoji ?? '🏅'} {opt?.label ?? s}
                          </span>
                        )
                      })
                    : <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">{sportEmoji} {sportLabel}</span>
                  }
                </div>
              </div>
            </div>

            {/* PlayerPath Progress */}
            <div className="sz-card p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-white/70" />
                  <span className="font-bold text-white">PlayerPath Progress</span>
                </div>
                <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{tier.label}</span>
              </div>
              <p className="text-white/50 text-sm mb-4">Track your journey to the top tier.</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Current: <span className="text-white font-bold">{tier.label}</span></span>
                <span className="text-white/70">Next: <span className="text-white font-bold">{nextTier}</span></span>
              </div>
              <div className="h-2 rounded-full bg-white/10 mb-3">
                <div className="h-2 rounded-full bg-yellow-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/40 text-xs">
                {pointsToNext > 0 ? `${pointsToNext.toLocaleString()} pts to ${nextTier}` : 'Max tier reached!'} · Keep logging to level up.
              </p>
            </div>

            {/* Your Quests */}
            <div className="sz-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-white/70" />
                <span className="font-bold text-white">Your Quests</span>
              </div>
              <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 w-fit">
                {(['Daily', 'Weekly', 'Monthly'] as QuestTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setQuestTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      questTab === tab ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {quests[questTab].map((q, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-bold text-white text-sm">{q.title}</p>
                        <p className="text-white/50 text-xs">{q.desc}</p>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm whitespace-nowrap">+{q.pp} PP</span>
                    </div>
                    {q.done ? (
                      <div className="flex justify-end">
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-lg">✓ Completed</span>
                      </div>
                    ) : q.inProgress && q.progress ? (
                      <>
                        <div className="h-1.5 rounded-full bg-white/10 mb-2">
                          <div
                            className="h-1.5 rounded-full bg-yellow-400/60"
                            style={{ width: `${Math.round((q.progress[0] / q.progress[1]) * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-xs">{q.progress[0]}/{q.progress[1]}</span>
                          <span className="text-xs bg-white/10 text-white/40 px-3 py-1 rounded-lg font-semibold">In Progress</span>
                        </div>
                      </>
                    ) : (
                      <button disabled className="btn-primary !py-1.5 !px-4 text-xs w-full mt-1 opacity-50 cursor-not-allowed">
                        Start Quest
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Coach Digest */}
            <div className="sz-card p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-white">AI Coach Digest</span>
                </div>
                {aiInsight && (
                  <button
                    onClick={() => {
                      if (!profile || activities.length === 0) return
                      setAiLoading(true); setAiInsight(null); setAiTips([])
                      fetch('/api/ai-coach', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ activities: activities.slice(0,10), totalScore: profile.totalScore, tier: getRankTier(profile.totalScore).label }),
                      }).then(r=>r.json()).then(d=>{ if(d.insight){setAiInsight(d.insight);setAiTips(d.tips??[])} }).catch(()=>{}).finally(()=>setAiLoading(false))
                    }}
                    disabled={aiLoading}
                    className="text-white/20 hover:text-white/50 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
              <p className="text-white/30 text-xs mb-4">Personalized to your recent training. Not medical advice.</p>

              {aiLoading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded-full animate-pulse w-full" />
                  <div className="h-3 bg-white/10 rounded-full animate-pulse w-4/5" />
                  <div className="h-3 bg-white/10 rounded-full animate-pulse w-3/4 mb-4" />
                  <div className="h-2 bg-white/5 rounded-full animate-pulse w-full" />
                  <div className="h-2 bg-white/5 rounded-full animate-pulse w-5/6" />
                </div>
              ) : aiInsight ? (
                <div>
                  <p className="text-white/80 text-sm leading-relaxed mb-4 border-l-2 border-yellow-400/40 pl-3">{aiInsight}</p>
                  {aiTips.length > 0 && (
                    <div className="space-y-2.5">
                      {aiTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-white/[0.03] rounded-xl p-3">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400/70 mt-0.5 shrink-0" />
                          <p className="text-white/55 text-xs leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bot className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">Log activities to unlock your personalized AI coaching digest.</p>
                </div>
              )}
            </div>

            {/* Featured Items */}
            <div className="sz-card p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-white/70" />
                  <span className="font-bold text-white">Featured Items For You</span>
                </div>
                <NextLink href="/marketplace" className="btn-ghost !py-1.5 !px-3 text-xs">View Marketplace</NextLink>
              </div>
              <p className="text-white/40 text-sm mb-4">Gear, players, and services near you.</p>
              <div className="text-center py-6 text-white/40 text-sm">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Browse the marketplace to find items related to your sports.
              </div>
            </div>

            {/* Featured Perks */}
            <div className="sz-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-white/70" />
                  <span className="font-bold text-white">Featured Perks For You</span>
                </div>
                <NextLink href="/perks" className="btn-ghost !py-1.5 !px-3 text-xs">View All Perks</NextLink>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { sponsor: 'Sponsored by Garmin', title: 'Garmin Watch Raffle', desc: 'Enter to win a Garmin Forerunner 265.' },
                  { sponsor: 'Sponsored by Nike',   title: '$10 Nike Gift Card',  desc: 'A digital gift card for Nike.com.' },
                ].map((perk, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/10 aspect-video flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white/20" />
                    </div>
                    <div className="p-3">
                      <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">{perk.sponsor}</span>
                      <p className="text-white font-bold text-sm mt-2">{perk.title}</p>
                      <p className="text-white/40 text-xs mt-1">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (40%) ───────────────────────────────────── */}
          <div className="lg:w-[40%] space-y-4">

            {/* Health & Performance */}
            <div className="sz-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <ActivityIcon className="w-5 h-5 text-white/70" />
                <span className="font-bold text-white">Health & Performance</span>
              </div>
              <p className="text-white/40 text-sm mb-4">Data from your connected devices.</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <HeartPulse className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-3xl font-black text-white">{avgHR ?? '—'}</p>
                  <p className="text-white/40 text-xs mt-1 leading-tight">
                    {avgHR ? 'Last Avg HR (bpm)' : 'Avg Heart Rate'}
                  </p>
                  {avgHR ? (
                    <span className="inline-block mt-2 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                      ✓ {recentVerified?.fitnessData?.source}
                    </span>
                  ) : (
                    <span className="inline-block mt-2 bg-white/10 text-white/30 text-xs px-2 py-0.5 rounded-full">Link Device</span>
                  )}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Wind className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-3xl font-black text-white">
                    {totalCalories > 0 ? `${(totalCalories / 1000).toFixed(1)}k` : '—'}
                  </p>
                  <p className="text-white/40 text-xs mt-1 leading-tight">
                    {totalCalories > 0 ? 'Total Kcal Burned' : 'Calories Burned'}
                  </p>
                  {totalCalories > 0 ? (
                    <span className="inline-block mt-2 bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">All time</span>
                  ) : (
                    <span className="inline-block mt-2 bg-white/10 text-white/30 text-xs px-2 py-0.5 rounded-full">Log activities</span>
                  )}
                </div>
              </div>

              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Weekly Activity</p>
              {actsLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="flex items-end gap-1.5 h-20 mb-1">
                  {weekBarHeights.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full rounded-t-sm bg-yellow-400" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5 mb-5">
                {BAR_DAYS.map((d, i) => (
                  <div key={i} className="flex-1 text-center text-white/30 text-xs">{d}</div>
                ))}
              </div>

              <button disabled className="btn-ghost w-full flex items-center justify-center gap-2 text-sm opacity-50 cursor-not-allowed">
                <ExternalLink className="w-4 h-4" />
                Link Device
              </button>
            </div>

            {/* Rankings & Records */}
            <div className="sz-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-white">My Rankings & Records</span>
              </div>
              <p className="text-white/40 text-sm mb-4">Your personal bests and leaderboard standings.</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <Medal className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Top Sport: {sportLabel}</p>
                    <p className="text-white/60 text-xs">See your rank on the leaderboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Most Calories Burned</p>
                    <p className="text-white/60 text-xs">
                      {maxCalAct?.fitnessData?.calories
                        ? `${maxCalAct.fitnessData.calories.toLocaleString()} kcal (${SPORT_OPTIONS.find(o => o.value === maxCalAct.sport)?.label ?? maxCalAct.sport})`
                        : 'No calorie data yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Longest Activity Streak</p>
                    <p className="text-white/60 text-xs">
                      {longestStreak > 0 ? `${longestStreak} day${longestStreak !== 1 ? 's' : ''}` : 'No streak yet'}
                    </p>
                  </div>
                </div>
              </div>

              <NextLink href="/leaderboard" className="btn-ghost w-full text-sm text-center block">
                View Leaderboards
              </NextLink>
            </div>

            {/* Badges & Achievements */}
            <div className="sz-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-white">My Badges & Achievements</span>
              </div>
              <p className="text-white/40 text-sm mb-4 leading-relaxed">
                Awards earned from your activities and milestones.
              </p>
              <div className="space-y-3">
                {badges.map((b, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 border rounded-xl p-3 transition-opacity ${
                      b.earned ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-40'
                    }`}
                  >
                    {b.icon}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{b.title}</p>
                      <p className="text-white/50 text-xs">{b.desc}</p>
                    </div>
                    {b.earned
                      ? <span className="shrink-0 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">✓ Earned</span>
                      : <span className="shrink-0 text-white/20 text-xs font-bold px-2 py-0.5 whitespace-nowrap">Locked</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
