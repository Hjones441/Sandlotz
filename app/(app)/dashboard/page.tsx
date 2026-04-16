'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getUserActivities, getRecentActivities, Activity } from '@/lib/firestore'
import { SPORT_OPTIONS, INTENSITY_LABELS, getRankTier, getTierProgress, formatScore } from '@/lib/sandlotzScore'
import {
  Zap, Clock, Ruler, Flame, Heart, Bookmark,
  ChevronRight, Bot, RefreshCw, Lightbulb, Bell, Star, Users, Target,
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
  if (d < 60)    return 'just now'
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
}

// Compute current streak from activities sorted desc
function calcStreak(acts: Activity[]): number {
  if (acts.length === 0) return 0
  const todayMs = new Date().setHours(0, 0, 0, 0)
  const days = new Set(acts.map(a => {
    const d = new Date((a.createdAt as any).seconds * 1000)
    return new Date(d.setHours(0, 0, 0, 0)).getTime()
  }))
  let streak = 0
  let check  = todayMs
  if (!days.has(check)) {
    check = todayMs - 86400000
    if (!days.has(check)) return 0
  }
  while (days.has(check)) {
    streak++
    check -= 86400000
  }
  return streak
}

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

// A single activity card for the community feed
function FeedCard({ act, isMe }: { act: Activity; isMe: boolean }) {
  const sp   = SPORT_OPTIONS.find(s => s.value === act.sport)
  const name = act.displayName ?? 'Athlete'
  const av   = name[0]?.toUpperCase() ?? '?'

  const stats: string[] = []
  if (act.durationMinutes) stats.push(formatDuration(act.durationMinutes))
  if (act.distanceKm > 0)  stats.push(`${act.distanceKm}km`)
  if (act.fitnessData?.heartRateAvg) stats.push(`${act.fitnessData.heartRateAvg}bpm`)
  if (act.fitnessData?.source && act.fitnessData.source !== 'Manual') stats.push(act.fitnessData.source)

  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
          isMe ? 'bg-brand-yellow text-brand-purple-dark' : 'bg-brand-purple border border-white/10 text-brand-yellow'
        }`}>
          {av}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <p className="font-bold text-sm">{name}{isMe && <span className="text-[10px] text-white/30 ml-1">(you)</span>}</p>
            <span className="text-[10px] text-white/25 ml-2 flex-shrink-0">{timeAgo(act.createdAt as any)}</span>
          </div>
          <p className="text-sm text-white/80 mt-0.5">
            {sp?.emoji ?? '🏅'} {sp?.label ?? act.sport}
          </p>
          {stats.length > 0 && (
            <p className="text-[11px] text-white/30 mt-0.5">{stats.join(' · ')}</p>
          )}
          {act.notes && (
            <p className="text-[11px] text-white/50 mt-1 italic line-clamp-1">"{act.notes}"</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.05]">
        <div className="flex items-center gap-3">
          <LikeBtn initial={Math.floor(Math.random() * 15)} />
          <SaveBtn />
        </div>
        <div className="flex items-center gap-1 bg-brand-yellow/10 rounded-full px-2.5 py-1">
          <Zap className="w-3 h-3 text-brand-yellow" />
          <span className="text-brand-yellow text-[11px] font-black">+{act.score}</span>
        </div>
      </div>
    </div>
  )
}

type Tab = 'feed' | 'mine' | 'challenges'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [tab,          setTab]          = useState<Tab>('feed')
  const [myActs,       setMyActs]       = useState<Activity[]>([])
  const [feed,         setFeed]         = useState<Activity[]>([])
  const [fetching,     setFetching]     = useState(true)
  const [feedFetching, setFeedFetching] = useState(true)
  const [aiInsight,    setAiInsight]    = useState<string | null>(null)
  const [aiTips,       setAiTips]       = useState<string[]>([])
  const [aiLoading,    setAiLoading]    = useState(false)
  const [aiOpen,       setAiOpen]       = useState(false)

  useEffect(() => { if (!loading && !user) router.replace('/login') }, [user, loading, router])

  // Load my activities
  useEffect(() => {
    if (!user) return
    getUserActivities(user.uid).then(a => { setMyActs(a); setFetching(false) })
  }, [user])

  // Load community feed
  useEffect(() => {
    getRecentActivities(30).then(a => { setFeed(a); setFeedFetching(false) })
  }, [])

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

  useEffect(() => { if (!fetching) fetchAI(myActs) }, [fetching, myActs, fetchAI])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-[3px] border-brand-yellow border-t-transparent animate-spin" />
    </div>
  }

  const tier    = getRankTier(profile?.totalScore ?? 0)
  const name    = profile?.displayName?.split(' ')[0] ?? 'Athlete'
  const totMins = myActs.reduce((s, a) => s + a.durationMinutes, 0)
  const totKm   = myActs.reduce((s, a) => s + a.distanceKm, 0)
  const streak  = calcStreak(myActs)

  return (
    <div className="max-w-lg mx-auto">

      {/* ── Sticky App Header ── */}
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
              <Link href="/notifications" className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-white/40" />
              </Link>
              <Link href="/profile" className="w-9 h-9 rounded-xl bg-brand-purple flex items-center justify-center font-black text-sm text-brand-yellow border border-white/10">
                {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
              </Link>
            </div>
          </div>

          {/* PlayerPath XP bar */}
          {(() => {
            const { pct, nextLabel, pointsToNext } = getTierProgress(profile?.totalScore ?? 0)
            return (
              <div className="mb-3 px-0.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/30 font-semibold tracking-wide">PLAYERPATH</span>
                  <span className="text-[10px] text-white/25">
                    {pointsToNext > 0 ? `${pointsToNext.toLocaleString()} pts → ${nextLabel}` : '🏆 Max Tier'}
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-brand-yellow to-yellow-300 rounded-full"
                  />
                </div>
              </div>
            )
          })()}

          {/* Stat pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
            {[
              { icon: <Zap   className="w-3 h-3" />, v: String(myActs.length),     l: 'Activities' },
              { icon: <Clock className="w-3 h-3" />, v: formatDuration(totMins),    l: 'Active time' },
              { icon: <Ruler className="w-3 h-3" />, v: `${totKm.toFixed(0)}km`,    l: 'Distance'   },
              { icon: <Flame className="w-3 h-3"/>, v: `${streak}🔥`,               l: 'Streak'     },
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

      {/* ── Scrollable body ── */}
      <div className="px-4 pt-4 space-y-4">

        {/* Daily Mission */}
        {(() => {
          const now = new Date()
          const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
          const weekStart  = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0)
          const todayActs  = myActs.filter(a => new Date((a.createdAt as any).seconds * 1000) >= todayStart)
          const weekCount  = myActs.filter(a => new Date((a.createdAt as any).seconds * 1000) >= weekStart).length
          const weekDist   = myActs.filter(a => new Date((a.createdAt as any).seconds * 1000) >= weekStart && (a.sport==='running'||a.sport==='cycling')).reduce((s,a)=>s+a.distanceKm,0)

          let mission: { title:string; desc:string; pp:number; progress?:[number,number]; done?:boolean } | null = null

          if (todayActs.length === 0)
            mission = { title:'Log Today\'s Activity', desc:'Keep your streak alive — every day counts.', pp:25 }
          else if (weekCount < 3)
            mission = { title:'Weekend Warrior', desc:'Log 3 activities this week for a bonus.', pp:75, progress:[weekCount,3] }
          else if (weekDist < 20)
            mission = { title:'Distance Chaser', desc:'Run or cycle 20 km this week.', pp:100, progress:[+weekDist.toFixed(1),20] }
          else
            mission = { title:'All Weekly Missions Complete', desc:'You\'re crushing it this week!', pp:0, done:true }

          if (!mission) return null
          const pct = mission.progress ? Math.round((mission.progress[0]/mission.progress[1])*100) : mission.done ? 100 : 0
          return (
            <div className={`rounded-2xl p-4 border ${mission.done ? 'bg-green-500/10 border-green-500/20' : 'bg-brand-yellow/8 border-brand-yellow/15'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${mission.done ? 'text-green-400' : 'text-brand-yellow'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${mission.done ? 'text-green-400' : 'text-brand-yellow'}`}>Daily Mission</span>
                </div>
                {mission.pp > 0 && (
                  <div className="flex items-center gap-1 bg-brand-yellow/10 rounded-full px-2.5 py-0.5">
                    <Star className="w-3 h-3 text-brand-yellow" />
                    <span className="text-brand-yellow text-[10px] font-black">+{mission.pp} PP</span>
                  </div>
                )}
              </div>
              <p className="font-bold text-sm text-white mb-0.5">{mission.title}</p>
              <p className="text-[11px] text-white/40 mb-2">{mission.desc}</p>
              {mission.progress && (
                <>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-brand-yellow rounded-full transition-all" style={{ width:`${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-white/30">{mission.progress[0]} / {mission.progress[1]}</p>
                </>
              )}
            </div>
          )
        })()}

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
              <button onClick={e => { e.stopPropagation(); setAiInsight(null); fetchAI(myActs) }} disabled={aiLoading} className="text-white/20 hover:text-white/50">
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

        {/* ── TABS ── */}
        <AnimatePresence mode="wait">

          {/* COMMUNITY FEED */}
          {tab === 'feed' && (
            <motion.div key="feed" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="space-y-3">
              {feedFetching ? (
                <div className="space-y-3">{[0,1,2].map(i => <ActivityCardSkeleton key={i} />)}</div>
              ) : feed.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No community activity yet.</p>
                  <p className="text-white/20 text-xs mt-1">Be the first to log a workout!</p>
                  <Link href="/log-activity" className="inline-block mt-4 btn-primary text-sm !py-2 !px-5">Log Activity</Link>
                </div>
              ) : (
                <>
                  {feed.map((act, i) => (
                    <motion.div key={act.id ?? i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                      <FeedCard act={act} isMe={act.uid === user.uid} />
                    </motion.div>
                  ))}
                  <p className="text-center text-white/15 text-xs py-4">All caught up</p>
                </>
              )}
            </motion.div>
          )}

          {/* MY ACTIVITY */}
          {tab === 'mine' && (
            <motion.div key="mine" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
              {fetching ? (
                <div className="space-y-3">{[0,1,2].map(i => <ActivityCardSkeleton key={i} />)}</div>
              ) : myActs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🏃</div>
                  <p className="text-white/40 font-semibold mb-1">No activities yet</p>
                  <p className="text-white/20 text-sm mb-6">Tap + to log your first workout</p>
                  <Link href="/log-activity" className="btn-primary inline-block">Log First Activity</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myActs.slice(0, 20).map((a, i) => {
                    const sp = SPORT_OPTIONS.find(s => s.value === a.sport)
                    return (
                      <motion.div key={a.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                        className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                          {sp?.emoji ?? '🏅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm capitalize">{sp?.label ?? a.sport}</p>
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

          {/* CHALLENGES */}
          {tab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="space-y-3">
              {CHALLENGES.map(c => <ChallengeCard key={c.id} c={c} />)}
              <Link href="/perks" className="flex items-center justify-center gap-1.5 w-full py-4 rounded-2xl border border-white/[0.06] text-xs text-white/25 hover:text-white/50 transition-colors">
                Browse all perks <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
