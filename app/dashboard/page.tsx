'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getUserActivities, Activity } from '@/lib/firestore'
import ScoreDisplay from '@/components/score/ScoreDisplay'
import { ActivityCardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton'
import {
  Zap, Trophy, Clock, Ruler, Flame, ChevronRight,
  MapPin, Plus, Megaphone, Gamepad2, Heart, Bookmark,
  TrendingUp, Users, Star,
} from 'lucide-react'
import { SPORT_OPTIONS, INTENSITY_LABELS } from '@/lib/sandlotzScore'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SportEmoji({ sport }: { sport: string }) {
  const found = SPORT_OPTIONS.find(s => s.value === sport)
  return <span>{found?.emoji ?? '🏅'}</span>
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`
}

function timeAgo(ts: { seconds: number } | undefined): string {
  if (!ts) return ''
  const diff = Date.now() / 1000 - ts.seconds
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Mock nearby feed (would be real Firestore in prod) ───────────────────────
const MOCK_NEARBY: Array<{
  id: string; name: string; sport: string; action: string;
  distance: string; pts: number; avatar: string; time: string
}> = [
  { id: '1', name: 'Marcus R.', sport: '🏃', action: 'Morning 10k Run',   distance: '0.3mi',  pts: 182, avatar: 'M', time: '4m ago' },
  { id: '2', name: 'Sierra T.', sport: '🏋️', action: 'Leg Day PR',        distance: '0.8mi',  pts: 95,  avatar: 'S', time: '12m ago' },
  { id: '3', name: 'Devon K.', sport: '🚴', action: '25mi Group Ride',    distance: '1.2mi',  pts: 210, avatar: 'D', time: '38m ago' },
  { id: '4', name: 'Aisha W.', sport: '🏊', action: '2000m Swim Session', distance: '2.1mi',  pts: 300, avatar: 'A', time: '1h ago'  },
  { id: '5', name: 'Jake M.',  sport: '⚡', action: 'HIIT Bootcamp',      distance: '0.5mi',  pts: 140, avatar: 'J', time: '2h ago'  },
]

const MOCK_EVENTS = [
  { id: '1', title: 'Columbus 5K Run',    date: 'Mar 22', sport: '🏃', spots: 48, joined: false },
  { id: '2', title: 'HIIT Challenge',     date: 'Mar 25', sport: '⚡', spots: 12, joined: true  },
  { id: '3', title: 'Pickup Basketball',  date: 'Mar 29', sport: '🏀', spots: 6,  joined: false },
  { id: '4', title: 'Cycling Century',    date: 'Apr 5',  sport: '🚴', spots: 30, joined: false },
]

const MOCK_ATHLETES = [
  { id: '1', name: 'LeBron F.',  tier: 'Legend', sport: '🏀', score: 14200, avatar: 'L' },
  { id: '2', name: 'Serena V.',  tier: 'Elite',  sport: '🎾', score: 8300,  avatar: 'S' },
  { id: '3', name: 'Michael J.', tier: 'Pro',    sport: '🏃', score: 3700,  avatar: 'M' },
  { id: '4', name: 'Gabby D.',   tier: 'Athlete',sport: '🏋️', score: 1200,  avatar: 'G' },
]

const TIER_COLORS: Record<string, string> = {
  Legend:  'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  Elite:   'text-purple-300 border-purple-300/40 bg-purple-300/10',
  Pro:     'text-blue-400   border-blue-400/40   bg-blue-400/10',
  Athlete: 'text-green-400  border-green-400/40  bg-green-400/10',
  Rookie:  'text-gray-400   border-gray-400/40   bg-gray-400/10',
}

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show:   (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.22 },
  }),
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SaveButton() {
  const [saved, setSaved] = useState(false)
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => setSaved(s => !s)}
      className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-brand-yellow' : 'text-white/30 hover:text-white/60'}`}
    >
      <Bookmark className={`w-4 h-4 ${saved ? 'fill-brand-yellow' : ''}`} />
    </motion.button>
  )
}

function LikeButton({ initial = 0 }: { initial?: number }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initial)
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => { setLiked(l => !l); setCount(c => liked ? c - 1 : c + 1) }}
      className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
      <span className="text-xs font-semibold">{count}</span>
    </motion.button>
  )
}

function JoinButton({ joined: init }: { joined: boolean }) {
  const [joined, setJoined] = useState(init)
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => setJoined(j => !j)}
      className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
        joined
          ? 'bg-white/10 border-white/20 text-white/60'
          : 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
      }`}
    >
      {joined ? 'Joined ✓' : 'Join'}
    </motion.button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router                     = useRouter()

  const [activities, setActivities] = useState<Activity[]>([])
  const [fetching,   setFetching]   = useState(true)

  // Swipe refs for athlete/event carousels
  const athleteRef = useRef<HTMLDivElement>(null)
  const eventRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUserActivities(user.uid)
      .then(setActivities)
      .finally(() => setFetching(false))
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  const recentActivities = activities.slice(0, 5)
  const totalMinutes     = activities.reduce((s, a) => s + a.durationMinutes, 0)
  const totalKm          = activities.reduce((s, a) => s + a.distanceKm, 0)
  const firstName        = profile?.displayName?.split(' ')[0] ?? 'Athlete'

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-28">

      {/* ── Location Bar ──────────────────────────────────────────────────── */}
      <motion.div
        custom={0} variants={FADE_UP} initial="hidden" animate="show"
        className="flex items-center justify-between mb-5"
      >
        <button className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2.5
                           border border-white/10 hover:border-brand-yellow/40 transition-colors">
          <MapPin className="w-4 h-4 text-brand-yellow" />
          <span className="text-sm font-semibold">{profile?.city ?? 'Columbus, OH'}</span>
          <ChevronRight className="w-4 h-4 text-white/30 rotate-90" />
        </button>
        <div className="text-right">
          <p className="text-xs text-white/40">Good {getGreeting()},</p>
          <p className="text-sm font-black">{firstName} 👋</p>
        </div>
      </motion.div>

      {/* ── Score strip ───────────────────────────────────────────────────── */}
      <motion.div custom={1} variants={FADE_UP} initial="hidden" animate="show" className="mb-6">
        <ScoreDisplay score={profile?.totalScore ?? 0} large />
      </motion.div>

      {/* ── Post / Promote / Play CTA row ─────────────────────────────────── */}
      <motion.div
        custom={2} variants={FADE_UP} initial="hidden" animate="show"
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { label: 'Post',    sub: 'Log workout',    icon: <Plus className="w-5 h-5" />,        href: '/log-activity', accent: 'bg-brand-yellow text-brand-purple-dark' },
          { label: 'Promote', sub: 'Share activity', icon: <Megaphone className="w-5 h-5" />,   href: '/log-activity', accent: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
          { label: 'Play',    sub: 'Join events',    icon: <Gamepad2 className="w-5 h-5" />,    href: '/perks',        accent: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`${item.accent} rounded-2xl p-4 text-center cursor-pointer transition-all`}
            >
              <div className="flex justify-center mb-1.5">{item.icon}</div>
              <p className="font-black text-sm">{item.label}</p>
              <p className="text-[10px] opacity-70 font-medium mt-0.5">{item.sub}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ── Quick stats strip ─────────────────────────────────────────────── */}
      <motion.div
        custom={3} variants={FADE_UP} initial="hidden" animate="show"
        className="grid grid-cols-4 gap-2 mb-8"
      >
        {fetching
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : [
              { icon: <Zap   className="w-4 h-4 text-brand-yellow" />, label: 'Acts',  value: activities.length },
              { icon: <Clock className="w-4 h-4 text-brand-yellow" />, label: 'Time',  value: formatDuration(totalMinutes) },
              { icon: <Ruler className="w-4 h-4 text-brand-yellow" />, label: 'km',    value: totalKm.toFixed(0) },
              { icon: <Flame className="w-4 h-4 text-brand-yellow" />, label: 'Sport', value: profile?.sport ?? '—' },
            ].map(s => (
              <div key={s.label} className="sz-card p-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">{s.label}</p>
                <p className="text-sm font-black capitalize truncate">{s.value}</p>
              </div>
            ))
        }
      </motion.div>

      {/* ── Live Nearby Activity Feed ──────────────────────────────────────── */}
      <motion.section custom={4} variants={FADE_UP} initial="hidden" animate="show" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h2 className="font-black text-base">Nearby Activity</h2>
          </div>
          <span className="text-xs text-white/40">{profile?.city ?? 'Columbus'}</span>
        </div>

        <div className="space-y-3">
          {MOCK_NEARBY.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              variants={FADE_UP}
              initial="hidden"
              animate="show"
              whileHover={{ x: 2 }}
              className="sz-card p-4 flex items-center gap-3 cursor-pointer group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-brand-purple flex items-center justify-center
                              font-black text-sm text-brand-yellow flex-shrink-0">
                {item.avatar}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">{item.name}</span>
                  <span className="text-xs text-white/30">·</span>
                  <span className="text-xs text-white/40">{item.distance}</span>
                </div>
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <span>{item.sport}</span>
                  <span className="truncate">{item.action}</span>
                </p>
              </div>
              {/* Right side */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-xs font-black text-brand-yellow">+{item.pts} pts</span>
                <div className="flex items-center gap-2">
                  <LikeButton initial={Math.floor(Math.random() * 12)} />
                  <SaveButton />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Swipeable Top Athletes ─────────────────────────────────────────── */}
      <motion.section custom={5} variants={FADE_UP} initial="hidden" animate="show" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-yellow" />
            <h2 className="font-black text-base">Top Athletes</h2>
          </div>
          <Link href="/leaderboard" className="text-xs text-brand-yellow hover:underline flex items-center gap-1">
            Full board <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          ref={athleteRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {MOCK_ATHLETES.map((athlete, i) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="sz-card p-5 snap-start flex-shrink-0 w-40 text-center cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-purple-mid mx-auto mb-3
                              flex items-center justify-center font-black text-xl text-brand-yellow">
                {athlete.avatar}
              </div>
              <p className="font-bold text-sm truncate">{athlete.name}</p>
              <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${TIER_COLORS[athlete.tier]}`}>
                <Star className="w-2.5 h-2.5" />
                {athlete.tier}
              </div>
              <p className="text-brand-yellow font-black text-sm mt-2">
                {(athlete.score / 1000).toFixed(1)}K pts
              </p>
              <p className="text-lg mt-1">{athlete.sport}</p>
            </motion.div>
          ))}

          {/* Leaderboard CTA card */}
          <Link href="/leaderboard" className="snap-start flex-shrink-0 w-40">
            <motion.div
              whileHover={{ y: -3 }}
              className="sz-card p-5 h-full flex flex-col items-center justify-center
                         border-brand-yellow/20 bg-brand-yellow/5 cursor-pointer"
            >
              <Trophy className="w-8 h-8 text-brand-yellow mb-2" />
              <p className="text-xs font-bold text-center text-brand-yellow">View Full Leaderboard</p>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* ── Swipeable Events / Challenges ─────────────────────────────────── */}
      <motion.section custom={6} variants={FADE_UP} initial="hidden" animate="show" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-yellow" />
            <h2 className="font-black text-base">Upcoming Events</h2>
          </div>
          <Link href="/perks" className="text-xs text-brand-yellow hover:underline flex items-center gap-1">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          ref={eventRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {MOCK_EVENTS.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="sz-card p-5 snap-start flex-shrink-0 w-52 cursor-pointer"
            >
              <div className="text-2xl mb-2">{evt.sport}</div>
              <p className="font-black text-sm mb-0.5 leading-tight">{evt.title}</p>
              <p className="text-xs text-white/40 mb-3">
                📅 {evt.date} · {evt.spots} spots left
              </p>
              <JoinButton joined={evt.joined} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Your Recent Activity ───────────────────────────────────────────── */}
      <motion.section custom={7} variants={FADE_UP} initial="hidden" animate="show">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-base">Your Recent Activity</h2>
          {activities.length > 5 && (
            <Link href="/profile" className="text-xs text-brand-yellow hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {fetching ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <ActivityCardSkeleton key={i} />)}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="sz-card p-10 text-center">
            <p className="text-white/40 mb-4">No activities yet — log your first workout!</p>
            <Link href="/log-activity" className="btn-primary inline-block">Post Activity</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((a, i) => (
              <motion.div
                key={a.id}
                custom={i}
                variants={FADE_UP}
                initial="hidden"
                animate="show"
                whileHover={{ x: 2 }}
                className="sz-card p-4 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple-mid flex items-center
                                  justify-center text-xl flex-shrink-0">
                    <SportEmoji sport={a.sport} />
                  </div>
                  <div>
                    <p className="font-bold text-sm capitalize">{a.sport}</p>
                    <p className="text-white/40 text-xs">
                      {formatDuration(a.durationMinutes)}
                      {a.distanceKm > 0 && ` · ${a.distanceKm}km`}
                      {' · '}{INTENSITY_LABELS[a.intensity]}
                    </p>
                    {/* Show fitness data badge if present */}
                    {a.fitnessData && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-white/10
                                       rounded-full px-2 py-0.5 text-white/50">
                        📊 {a.fitnessData.source}
                        {a.fitnessData.heartRateAvg && ` · ${a.fitnessData.heartRateAvg}bpm`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-brand-yellow text-sm">+{a.score} pts</p>
                  <p className="text-white/30 text-xs">
                    {timeAgo(a.createdAt as unknown as { seconds: number })}
                  </p>
                  {/* Screenshot thumbnail */}
                  {a.imageUrls && a.imageUrls.length > 0 && (
                    <div className="flex gap-1 mt-1 justify-end">
                      {a.imageUrls.slice(0, 2).map((url, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                          <Image src={url} alt="activity" width={32} height={32} className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
