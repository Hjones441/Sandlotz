'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getUserActivities, Activity } from '@/lib/firestore'
import { SPORT_OPTIONS, INTENSITY_LABELS, getRankTier, formatScore } from '@/lib/sandlotzScore'
import {
  Zap, Clock, Ruler, MapPin, Heart, Bookmark,
  ChevronRight, Bot, RefreshCw, Lightbulb, Bell, Star,
} from 'lucide-react'
import { ActivityCardSkeleton } from '@/components/ui/Skeleton'

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

const FEED = [
  { id:'1', name:'Marcus R.',  av:'M', emoji:'🏃', action:'Morning 10k',      stats:'10km · 47min · 152bpm', pts:182, time:'4m',  likes:11 },
  { id:'2', name:'Sierra T.',  av:'S', emoji:'🏋️', action:'Leg Day PR',       stats:'60min · intensity 5',   pts:95,  time:'12m', likes:7  },
  { id:'3', name:'Devon K.',   av:'D', emoji:'🚴', action:'25mi Group Ride',  stats:'40km · 1h 38m · Garmin',pts:210, time:'38m', likes:14 },
  { id:'4', name:'Aisha W.',   av:'A', emoji:'🏊', action:'Masters Swim Set', stats:'2.0km · 52min · Whoop', pts:300, time:'1h',  likes:22 },
  { id:'5', name:'Jake M.',    av:'J', emoji:'⚡', action:'HIIT Bootcamp',    stats:'45min · 520 kcal',      pts:140, time:'2h',  likes:9  },
]

const CHALLENGES = [
  { id:'1', title:'June Run Streak',  sport:'🏃', target:'30 days running',  reward:'500 PP', joined:false, pct:0  },
  { id:'2', title:'Summer Grind',     sport:'⚡', target:'20 HIIT sessions', reward:'750 PP', joined:true,  pct:40 },
  { id:'3', title:'Century Ride',     sport:'🚴', target:'100km this week',  reward:'400 PP', joined:false, pct:0  },
]

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

function ChallengeCard({ c }: { c: typeof CHALLENGES[0] }) {
  const [joined, setJoined] = useState(c.joined)
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{c.sport}</span>
          <div>
            <p className="font-bold text-sm">{c.title}</p>
            <p className="text-white/40 text-xs">{c.target}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-yellow/10 rounded-full px-2.5 py-1 flex-shrink-0">
          <Star className="w-3 h-3 text-brand-yellow" />
          <span className="text-brand-yellow text-[10px] font-black">{c.reward}</span>
        </div>
      </div>
      {joined && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-white/40 mb-1">
            <span>Progress</span><span>{c.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-brand-yellow transition-all" style={{ width: `${c.pct}%` }} />
          </div>
        </div>
      )}
      <motion.button whileTap={{ scale: 0.96 }} onClick={() => setJoined(j => !j)}
        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
          joined ? 'bg-white/5 border border-white/10 text-white/40' : 'bg-brand-yellow text-brand-purple-dark'
        }`}>
        {joined ? 'Joined ✓' : 'Join Challenge'}
      </motion.button>
    </div>
  )
}

type Tab = 'feed' | 'mine' | 'challenges'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [tab,       setTab]       = useState<Tab>('feed')
  const [acts,      setActs]      = useState<Activity[]>([])
  const [fetching,  setFetching]  = useState(true)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [aiTips,    setAiTips]    = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiOpen,    setAiOpen]    = useState(false)

  useEffect(() => { if (!loading && !user) router.replace('/login') }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUserActivities(user.uid).then(a => { setActs(a); setFetching(false) })
  }, [user])

  const fetchAI = useCallback(async (a: Activity[]) => {
    if (!profile || aiInsight !== null) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: a.slice(0, 10), totalScore: profile.totalScore, tier: getRankTier(profile.totalScore).label }),
      })
      const d = await res.json()
      if (d.insight) { setAiInsight(d.insight); setAiTips(d.tips ?? []) }
    } catch { /* silent */ } finally { setAiLoading(false) }
  }, [profile, aiInsight])

  useEffect(() => { if (!fetching) fetchAI(acts) }, [fetching, acts, fetchAI])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-[3px] border-brand-yellow border-t-transparent animate-spin" />
    </div>
  }

  const tier    = getRankTier(profile?.totalScore ?? 0)
  const name    = profile?.displayName?.split(' ')[0] ?? 'Athlete'
  const totMins = acts.reduce((s, a) => s + a.durationMinutes, 0)
  const totKm   = acts.reduce((s, a) => s + a.distanceKm, 0)

  return (
    <div className="max-w-lg mx-auto">

      {/* ── Sticky App Header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="px-4 pt-4 pb-0">

          {/* Score row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-white/35 font-medium tracking-wide">{getGreeting()}, {name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black text-brand-yellow">{formatScore(profile?.totalScore ?? 0)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>{tier.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-white/40" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-yellow rounded-full" />
              </button>
              <Link href="/profile" className="w-9 h-9 rounded-xl bg-brand-purple flex items-center justify-center font-black text-sm text-brand-yellow border border-white/10">
                {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
              </Link>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
            {[
              { icon: <Zap   className="w-3 h-3" />, v: String(acts.length),          l: 'Activities' },
              { icon: <Clock className="w-3 h-3" />, v: formatDuration(totMins),       l: 'Active time' },
              { icon: <Ruler className="w-3 h-3" />, v: `${totKm.toFixed(0)}km`,       l: 'Distance'   },
              { icon: <MapPin className="w-3 h-3"/>, v: profile?.city ?? 'Local',      l: 'City'       },
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

      {/* ── Scrollable body ────────────────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-4">

        {/* AI Coach card */}
        <motion.div layout className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03]">
          <button onClick={() => setAiOpen(o => !o)} className="w-full flex items-center gap-3 p-3.5">
            <div className="w-8 h-8 rounded-xl bg-brand-yellow/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-yellow" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider">AI Coach</p>
              {aiLoading
                ? <div className="h-3 w-40 bg-white/10 rounded-full animate-pulse mt-0.5" />
                : <p className="text-xs text-white/60 truncate">{aiInsight ?? 'Log activities to unlock insights'}</p>
              }
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={e => { e.stopPropagation(); fetchAI(acts) }} disabled={aiLoading} className="text-white/20 hover:text-white/50">
                <RefreshCw className={`w-3 h-3 ${aiLoading?'animate-spin':''}`} />
              </button>
              <ChevronRight className={`w-3.5 h-3.5 text-white/20 transition-transform ${aiOpen?'rotate-90':''}`} />
            </div>
          </button>
          <AnimatePresence>
            {aiOpen && aiTips.length > 0 && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}
                className="border-t border-white/[0.06] px-3.5 py-3 space-y-2">
                {aiTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Lightbulb className="w-3 h-3 text-brand-yellow/60 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-white/45 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── FEED ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {tab === 'feed' && (
            <motion.div key="feed" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="space-y-3">
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
              <p className="text-center text-white/15 text-xs py-4">All caught up</p>
            </motion.div>
          )}

          {/* ── MY ACTIVITY ─────────────────────────────────────────── */}
          {tab === 'mine' && (
            <motion.div key="mine" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
              {fetching ? (
                <div className="space-y-3">{[0,1,2].map(i => <ActivityCardSkeleton key={i} />)}</div>
              ) : acts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🏃</div>
                  <p className="text-white/40 font-semibold mb-1">No activities yet</p>
                  <p className="text-white/20 text-sm mb-6">Tap + to log your first workout</p>
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
                          <p className="text-white/20 text-[10px]">{timeAgo(a.createdAt as any)}</p>
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

          {/* ── CHALLENGES ──────────────────────────────────────────── */}
          {tab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="space-y-3">
              {CHALLENGES.map(c => <ChallengeCard key={c.id} c={c} />)}
              <Link href="/perks" className="flex items-center justify-center gap-1.5 w-full py-4 rounded-2xl border border-white/[0.06] text-xs text-white/25 hover:text-white/50 transition-colors">
                Browse all challenges <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
