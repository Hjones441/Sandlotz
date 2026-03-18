'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getUserActivities, updateUserProfile, Activity } from '@/lib/firestore'
import { SPORT_OPTIONS, INTENSITY_LABELS, formatScore, getRankTier } from '@/lib/sandlotzScore'
import ScoreDisplay from '@/components/score/ScoreDisplay'
import Image from 'next/image'
import { Edit2, Save, X, Clock, Ruler } from 'lucide-react'

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

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  const [activities,  setActivities]  = useState<Activity[]>([])
  const [fetching,    setFetching]    = useState(true)
  const [editing,     setEditing]     = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [sport,       setSport]       = useState('other')
  const [city,        setCity]        = useState('Columbus')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setSport(profile.sport)
      setCity(profile.city)
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    getUserActivities(user.uid)
      .then(setActivities)
      .finally(() => setFetching(false))
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { displayName, sport, city })
      await refreshProfile()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  const tier = getRankTier(profile.totalScore)

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">

      {/* Profile card */}
      <div className="sz-card p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="shrink-0">
            {profile.photoURL ? (
              <Image
                src={profile.photoURL}
                alt={profile.displayName}
                width={80}
                height={80}
                className="rounded-full object-cover ring-4 ring-brand-yellow/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-purple flex items-center justify-center
                              text-brand-yellow font-black text-3xl ring-4 ring-brand-yellow/30">
                {profile.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>

          {/* Info */}
          {editing ? (
            <div className="flex-1 w-full space-y-3">
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white
                           focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="Display name"
              />
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white
                           focus:outline-none focus:border-brand-yellow transition-colors"
              >
                {SPORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value} className="bg-brand-purple-dark">
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white
                           focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="City"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !px-4 flex items-center gap-2 text-sm">
                  <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost !py-2 !px-4 flex items-center gap-2 text-sm">
                  <X className="w-4 h-4" />Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black">{profile.displayName}</h1>
                  <p className={`font-bold ${tier.color}`}>{tier.label}</p>
                  <p className="text-white/40 text-sm mt-1">
                    {SPORT_OPTIONS.find(s => s.value === profile.sport)?.emoji}{' '}
                    {SPORT_OPTIONS.find(s => s.value === profile.sport)?.label ?? 'Other'}
                    {' · '}{profile.city}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-ghost !py-2 !px-3 flex items-center gap-2 text-sm"
                >
                  <Edit2 className="w-4 h-4" />Edit
                </button>
              </div>
              <p className="text-white/30 text-sm mt-2">{profile.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="mb-6">
        <ScoreDisplay score={profile.totalScore} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Activities', value: activities.length },
          { label: 'Total Time',  value: formatDuration(activities.reduce((s, a) => s + a.durationMinutes, 0)) },
          { label: 'Total km',    value: activities.reduce((s, a) => s + a.distanceKm, 0).toFixed(1) },
        ].map(s => (
          <div key={s.label} className="sz-card p-4 text-center">
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity history */}
      <h2 className="text-lg font-black mb-4">Activity History</h2>
      {fetching ? (
        <div className="sz-card p-8 text-center text-white/40">Loading…</div>
      ) : activities.length === 0 ? (
        <div className="sz-card p-10 text-center text-white/40">No activities yet.</div>
      ) : (
        <div className="space-y-3">
          {activities.map(a => (
            <div key={a.id} className="sz-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">
                  {SPORT_OPTIONS.find(s => s.value === a.sport)?.emoji ?? '🏅'}
                </span>
                <div>
                  <p className="font-bold capitalize">{a.sport}</p>
                  <div className="flex items-center gap-3 text-white/40 text-xs mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatDuration(a.durationMinutes)}
                    </span>
                    {a.distanceKm > 0 && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />{a.distanceKm}km
                      </span>
                    )}
                    <span>{INTENSITY_LABELS[a.intensity]}</span>
                  </div>
                  {a.notes && <p className="text-white/30 text-xs mt-1 truncate max-w-xs">{a.notes}</p>}
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
  )
}
