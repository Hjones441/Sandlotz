'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getUserActivities, Activity } from '@/lib/firestore'
import ScoreDisplay from '@/components/score/ScoreDisplay'
import { Zap, Trophy, Clock, Ruler, Flame, ChevronRight } from 'lucide-react'
import { SPORT_OPTIONS, INTENSITY_LABELS } from '@/lib/sandlotzScore'

function SportEmoji({ sport }: { sport: string }) {
  const found = SPORT_OPTIONS.find(s => s.value === sport)
  return <span>{found?.emoji ?? '🏅'}</span>
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function timeAgo(ts: { seconds: number } | undefined): string {
  if (!ts) return ''
  const diff = Date.now() / 1000 - ts.seconds
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [fetching,   setFetching]   = useState(true)

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
  const totalActivities  = activities.length
  const totalMinutes     = activities.reduce((s, a) => s + a.durationMinutes, 0)
  const totalKm          = activities.reduce((s, a) => s + a.distanceKm, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          Welcome back, <span className="text-gold">{profile?.displayName?.split(' ')[0] ?? 'Athlete'}</span>
        </h1>
        <p className="text-white/50 mt-1">Here&apos;s your performance overview</p>
      </div>

      {/* Top grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Score */}
        <ScoreDisplay score={profile?.totalScore ?? 0} large />

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <Zap    className="w-5 h-5 text-brand-yellow" />, label: 'Activities', value: totalActivities },
            { icon: <Clock  className="w-5 h-5 text-brand-yellow" />, label: 'Total Time',  value: formatDuration(totalMinutes) },
            { icon: <Ruler  className="w-5 h-5 text-brand-yellow" />, label: 'Total km',    value: totalKm.toFixed(1) },
            { icon: <Flame  className="w-5 h-5 text-brand-yellow" />, label: 'Sport',       value: profile?.sport ?? '—' },
          ].map(s => (
            <div key={s.label} className="sz-card p-5">
              <div className="flex items-center gap-2 mb-2">{s.icon}
                <span className="text-xs text-white/50 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-black capitalize">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Log */}
      <div className="sz-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8
                      border-brand-yellow/20 bg-brand-yellow/5">
        <div>
          <p className="font-black text-lg">Log Today&apos;s Workout</p>
          <p className="text-white/50 text-sm">Every rep counts toward your Sandlotz Score™</p>
        </div>
        <Link href="/log-activity" className="btn-primary whitespace-nowrap">
          Post Activity
        </Link>
      </div>

      {/* Recent activities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">Recent Activity</h2>
          {totalActivities > 5 && (
            <Link href="/profile" className="text-brand-yellow text-sm hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {fetching ? (
          <div className="sz-card p-8 text-center text-white/40">Loading activities…</div>
        ) : recentActivities.length === 0 ? (
          <div className="sz-card p-10 text-center">
            <p className="text-white/40 mb-4">No activities yet — log your first workout!</p>
            <Link href="/log-activity" className="btn-primary inline-block">Post Activity</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map(a => (
              <div key={a.id} className="sz-card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl"><SportEmoji sport={a.sport} /></div>
                  <div>
                    <p className="font-bold capitalize">{a.sport}</p>
                    <p className="text-white/40 text-sm">
                      {formatDuration(a.durationMinutes)}
                      {a.distanceKm > 0 && ` · ${a.distanceKm}km`}
                      {' · '}
                      {INTENSITY_LABELS[a.intensity]}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-brand-yellow">+{a.score} pts</p>
                  <p className="text-white/30 text-xs">
                    {timeAgo(a.createdAt as unknown as { seconds: number })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard teaser */}
      <div className="mt-8 sz-card p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-brand-yellow" />
          <div>
            <p className="font-bold">Columbus Leaderboard</p>
            <p className="text-white/40 text-sm">See how you rank locally</p>
          </div>
        </div>
        <Link href="/leaderboard" className="btn-ghost !py-2 !px-4 text-sm">
          View Rankings
        </Link>
      </div>
    </div>
  )
}
