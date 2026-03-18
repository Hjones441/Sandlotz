'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { logActivity } from '@/lib/firestore'
import {
  SPORT_OPTIONS,
  INTENSITY_LABELS,
  SportType,
  calculateActivityScore,
} from '@/lib/sandlotzScore'
import { Zap } from 'lucide-react'

export default function LogActivityPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  const [sport,    setSport]    = useState<SportType>('running')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [intensity,setIntensity]= useState(3)
  const [notes,    setNotes]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [earned,   setEarned]   = useState<number | null>(null)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Live score preview
  const previewScore = calculateActivityScore(
    sport,
    Number(duration) || 0,
    Number(distance) || 0,
    intensity,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    if (!duration || Number(duration) <= 0) { setError('Please enter a valid duration.'); return }

    setError('')
    setSubmitting(true)
    try {
      const pts = await logActivity({
        uid:             user.uid,
        sport,
        durationMinutes: Number(duration),
        distanceKm:      Number(distance) || 0,
        intensity,
        notes,
        city:            profile.city ?? 'Columbus',
        displayName:     profile.displayName,
        photoURL:        profile.photoURL ?? null,
      })
      await refreshProfile()
      setEarned(pts)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log activity.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleAnother() {
    setEarned(null)
    setSport('running')
    setDuration('')
    setDistance('')
    setIntensity(3)
    setNotes('')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  // Success screen
  if (earned !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="sz-card p-12 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-3xl font-black mb-2">Activity Logged!</h2>
          <p className="text-white/50 mb-6">You earned</p>
          <p className="text-6xl font-black text-gold mb-2">+{earned}</p>
          <p className="text-brand-yellow font-bold mb-8">PlayerPoints</p>
          <div className="flex flex-col gap-3">
            <button onClick={handleAnother} className="btn-primary">Log Another</button>
            <button onClick={() => router.push('/dashboard')} className="btn-ghost">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-16">
      <h1 className="text-3xl font-black mb-1">Post Activity</h1>
      <p className="text-white/50 mb-8">Log your workout and earn PlayerPoints</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sport */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3">Sport</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SPORT_OPTIONS.map(s => (
              <button
                type="button"
                key={s.value}
                onClick={() => setSport(s.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all
                  ${sport === s.value
                    ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className="text-xl">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2">
            Duration <span className="text-white/30">(minutes)</span>
          </label>
          <input
            type="number"
            min="1"
            max="600"
            required
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 45"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
          />
        </div>

        {/* Distance */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2">
            Distance <span className="text-white/30">(km — optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="e.g. 5.0"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
          />
        </div>

        {/* Intensity */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3">
            Intensity — <span className="text-brand-yellow">{INTENSITY_LABELS[intensity]}</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                type="button"
                key={i}
                onClick={() => setIntensity(i)}
                className={`py-3 rounded-xl border text-sm font-black transition-all
                  ${intensity === i
                    ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-white/30">Easy</span>
            <span className="text-xs text-white/30">Max Effort</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2">
            Notes <span className="text-white/30">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Morning run, felt great…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors resize-none"
          />
        </div>

        {/* Score preview */}
        {previewScore > 0 && (
          <div className="sz-card p-5 flex items-center justify-between border-brand-yellow/20 bg-brand-yellow/5">
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="w-5 h-5 text-brand-yellow" />
              <span className="text-sm font-semibold">Points Preview</span>
            </div>
            <p className="text-2xl font-black text-brand-yellow">+{previewScore}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full text-lg">
          {submitting ? 'Logging…' : 'Log Activity'}
        </button>
      </form>
    </div>
  )
}
