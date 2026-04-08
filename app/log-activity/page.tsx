'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { logActivity, FitnessData } from '@/lib/firestore'
import { uploadActivityImage } from '@/lib/storage'
import {
  SPORT_OPTIONS,
  INTENSITY_LABELS,
  SportType,
  calculateActivityScoreDetailed,
  validateFitnessData,
  type ScoreBreakdown,
} from '@/lib/sandlotzScore'
import {
  Zap, Upload, X, Heart, Flame, Footprints,
  Mountain, Timer, ChevronDown, ChevronUp, Image as ImageIcon,
  Link2, RefreshCw, CheckCircle2,
} from 'lucide-react'

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

const FITNESS_SOURCES = ['Manual', 'Strava', 'Garmin', 'Apple Health', 'Polar', 'Wahoo', 'Whoop', 'Other']

interface StravaActivity {
  stravaId:        number
  name:            string
  sport:           string
  durationMinutes: number
  distanceKm:      number
  elevationGain:   number
  heartRateAvg?:   number
  heartRateMax?:   number
  calories?:       number
  paceMinPerKm?:   string
  startDate:       string
}

export default function LogActivityPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  // Core fields
  const [sport,       setSport]       = useState<SportType>('running')
  const [duration,    setDuration]    = useState('')
  const [distance,    setDistance]    = useState('')
  const [intensity,   setIntensity]   = useState(3)
  const [notes,       setNotes]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [earned,      setEarned]      = useState<number | null>(null)
  const [error,       setError]       = useState('')

  // Screenshot upload
  const fileInputRef                  = useRef<HTMLInputElement>(null)
  const [images,      setImages]      = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(false)

  // Fitness data section
  const [showFitnessData, setShowFitnessData] = useState(false)
  const [fitnessSource,   setFitnessSource]   = useState('Manual')
  const [heartRateAvg,    setHeartRateAvg]     = useState('')
  const [heartRateMax,    setHeartRateMax]     = useState('')
  const [calories,        setCalories]         = useState('')
  const [steps,           setSteps]            = useState('')
  const [pace,            setPace]             = useState('')
  const [elevationGain,   setElevationGain]    = useState('')

  // Strava integration
  const [stravaConnected,   setStravaConnected]   = useState(false)
  const [stravaActivities,  setStravaActivities]  = useState<StravaActivity[]>([])
  const [stravaLoading,     setStravaLoading]     = useState(false)
  const [stravaError,       setStravaError]       = useState('')
  const [showStravaList,    setShowStravaList]     = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Check for Strava connection status from URL params after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('strava') === 'connected') {
      setStravaConnected(true)
      window.history.replaceState({}, '', '/log-activity')
      fetchStravaActivities()
    } else if (params.get('strava') === 'denied') {
      setStravaError('Strava connection was denied.')
    }
    // Try fetching activities silently (tokens may already be in cookie from a prior session)
    fetchStravaActivities()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchStravaActivities() {
    setStravaLoading(true)
    setStravaError('')
    try {
      const res = await fetch('/api/strava/activities')
      if (res.status === 401) { setStravaConnected(false); return }
      if (!res.ok) throw new Error('Failed to fetch Strava activities')
      const data = await res.json()
      setStravaActivities(data.activities ?? [])
      setStravaConnected(true)
    } catch {
      // Silently fail — user can still log manually
    } finally {
      setStravaLoading(false)
    }
  }

  function connectStrava() {
    const clientId   = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const redirectUri = encodeURIComponent(`${appUrl}/api/strava/callback`)
    const scope       = 'read,activity:read_all'
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
  }

  function populateFromStrava(activity: StravaActivity) {
    setSport((activity.sport as SportType) || 'other')
    setDuration(String(activity.durationMinutes))
    setDistance(String(activity.distanceKm))
    setNotes(activity.name)
    setFitnessSource('Strava')
    if (activity.heartRateAvg) setHeartRateAvg(String(activity.heartRateAvg))
    if (activity.heartRateMax) setHeartRateMax(String(activity.heartRateMax))
    if (activity.calories)     setCalories(String(activity.calories))
    if (activity.elevationGain) setElevationGain(String(activity.elevationGain))
    if (activity.paceMinPerKm)  setPace(activity.paceMinPerKm)
    setShowFitnessData(true)
    setShowStravaList(false)
    // Auto-set intensity based on HR
    if (activity.heartRateAvg) {
      if (activity.heartRateAvg >= 170) setIntensity(5)
      else if (activity.heartRateAvg >= 150) setIntensity(4)
      else if (activity.heartRateAvg >= 130) setIntensity(3)
      else setIntensity(2)
    }
  }

  const fitnessScoringData = showFitnessData
    ? {
        source:        fitnessSource,
        heartRateAvg:  heartRateAvg  ? Number(heartRateAvg)  : undefined,
        elevationGain: elevationGain ? Number(elevationGain) : undefined,
        calories:      calories      ? Number(calories)      : undefined,
      }
    : undefined

  const scoreBreakdown: ScoreBreakdown = calculateActivityScoreDetailed(
    sport,
    Number(duration) || 0,
    Number(distance) || 0,
    intensity,
    fitnessScoringData,
  )
  const previewScore = scoreBreakdown.total

  const plausibilityWarnings = showFitnessData && fitnessScoringData
    ? validateFitnessData(Number(duration) || 0, fitnessScoringData)
    : []

  function handleFileChange(files: FileList | null) {
    if (!files) return
    const newFiles  = Array.from(files).filter(f => f.type.startsWith('image/'))
    const combined  = [...images, ...newFiles].slice(0, 4) // max 4 images
    setImages(combined)
    const previews  = combined.map(f => URL.createObjectURL(f))
    setImagePreviews(previews)
  }

  function removeImage(idx: number) {
    const newImages   = images.filter((_, i) => i !== idx)
    const newPreviews = imagePreviews.filter((_, i) => i !== idx)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFileChange(e.dataTransfer.files)
  }

  function buildFitnessData(): FitnessData | undefined {
    const hasData =
      heartRateAvg || heartRateMax || calories || steps || pace || elevationGain
    if (!hasData) return undefined
    return {
      source:        fitnessSource,
      heartRateAvg:  heartRateAvg  ? Number(heartRateAvg)  : undefined,
      heartRateMax:  heartRateMax  ? Number(heartRateMax)  : undefined,
      calories:      calories      ? Number(calories)      : undefined,
      steps:         steps         ? Number(steps)         : undefined,
      pace:          pace          || undefined,
      elevationGain: elevationGain ? Number(elevationGain) : undefined,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    if (!duration || Number(duration) <= 0) { setError('Please enter a valid duration.'); return }

    setError('')
    setSubmitting(true)
    setUploadProgress(images.length > 0)

    try {
      // Upload images first
      const imageUrls: string[] = []
      for (const file of images) {
        const url = await uploadActivityImage(user.uid, file)
        imageUrls.push(url)
      }
      setUploadProgress(false)

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
        imageUrls:       imageUrls.length > 0 ? imageUrls : undefined,
        fitnessData:     buildFitnessData(),
      })
      await refreshProfile()
      setEarned(pts)
    } catch (err: unknown) {
      setUploadProgress(false)
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
    setImages([])
    setImagePreviews([])
    setHeartRateAvg('')
    setHeartRateMax('')
    setCalories('')
    setSteps('')
    setPace('')
    setElevationGain('')
    setShowFitnessData(false)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (earned !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="sz-card p-12 max-w-sm w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <h2 className="text-3xl font-black mb-2">Activity Logged!</h2>
          <p className="text-white/50 mb-6">You earned</p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-6xl font-black text-brand-yellow mb-2"
          >
            +{earned}
          </motion.p>
          <p className="text-brand-yellow font-bold mb-8">PlayerPoints</p>
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 justify-center mb-6">
              {imagePreviews.slice(0, 3).map((src, i) => (
                <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                  <Image src={src} alt="activity" width={56} height={56} className="object-cover w-full h-full" unoptimized />
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={handleAnother} className="btn-primary">Log Another</button>
            <button onClick={() => router.push('/dashboard')} className="btn-ghost">
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-24">
      <motion.div variants={FADE_UP} initial="hidden" animate="show">
        <h1 className="text-3xl font-black mb-1">Post Activity</h1>
        <p className="text-white/50 mb-8">Log your workout and earn PlayerPoints</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Strava Connect / Import ────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show">
          {stravaConnected ? (
            <div className="sz-card overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FC4C02]/10 rounded-lg flex items-center justify-center">
                    <span className="text-[#FC4C02] font-black text-sm">S</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Strava Connected
                    </p>
                    <p className="text-xs text-white/40">{stravaActivities.length} recent activities available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchStravaActivities}
                    disabled={stravaLoading}
                    className="btn-ghost !py-1.5 !px-3 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${stravaLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStravaList(!showStravaList)}
                    className="btn-primary !py-1.5 !px-3 text-xs"
                  >
                    Import Activity
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showStravaList && stravaActivities.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {stravaActivities.map(a => (
                        <button
                          key={a.stravaId}
                          type="button"
                          onClick={() => populateFromStrava(a)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{a.name}</p>
                            <p className="text-white/40 text-xs">
                              {a.durationMinutes}min · {a.distanceKm}km
                              {a.heartRateAvg ? ` · ${a.heartRateAvg} bpm avg` : ''}
                              {a.calories     ? ` · ${a.calories} kcal` : ''}
                            </p>
                          </div>
                          <span className="text-yellow-400 text-xs font-bold ml-3 shrink-0">Import →</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectStrava}
              disabled={!process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 bg-[#FC4C02]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#FC4C02] font-black text-sm">S</span>
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect Strava
                  {!process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID && <span className="text-white/30 font-normal text-xs">(configure NEXT_PUBLIC_STRAVA_CLIENT_ID)</span>}
                </p>
                <p className="text-white/40 text-xs">Auto-import your activities — HR, calories, elevation included</p>
              </div>
              <span className="text-yellow-400 text-xs font-bold ml-auto">+5% verified bonus →</span>
            </button>
          )}
          {stravaError && <p className="text-red-400 text-xs mt-2 text-center">{stravaError}</p>}
        </motion.div>

        {/* ── Sport ─────────────────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          <label className="block text-sm font-semibold text-white/70 mb-3">Sport</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SPORT_OPTIONS.map(s => (
              <motion.button
                type="button"
                key={s.value}
                onClick={() => setSport(s.value)}
                whileTap={{ scale: 0.93 }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all
                  ${sport === s.value
                    ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className="text-xl">{s.emoji}</span>
                {s.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Duration + Distance ────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Duration <span className="text-white/30">(min)</span>
            </label>
            <input
              type="number" min="1" max="600" required
              value={duration} onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 45"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                         placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Distance <span className="text-white/30">(km)</span>
            </label>
            <input
              type="number" min="0" step="0.1"
              value={distance} onChange={e => setDistance(e.target.value)}
              placeholder="e.g. 5.0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                         placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
            />
          </div>
        </motion.div>

        {/* ── Intensity ─────────────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <label className="block text-sm font-semibold text-white/70 mb-3">
            Intensity — <span className="text-brand-yellow">{INTENSITY_LABELS[intensity]}</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.button
                type="button" key={i}
                onClick={() => setIntensity(i)}
                whileTap={{ scale: 0.9 }}
                className={`py-3 rounded-xl border text-sm font-black transition-all
                  ${intensity === i
                    ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {i}
              </motion.button>
            ))}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-white/30">Easy</span>
            <span className="text-xs text-white/30">Max Effort</span>
          </div>
        </motion.div>

        {/* ── Notes ─────────────────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
          <label className="block text-sm font-semibold text-white/70 mb-2">
            Notes <span className="text-white/30">(optional)</span>
          </label>
          <textarea
            rows={3} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Morning run, felt great…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors resize-none"
          />
        </motion.div>

        {/* ── Screenshot Upload ──────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.14 }}>
          <label className="block text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Screenshots <span className="text-white/30">(up to 4 — optional)</span>
          </label>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center cursor-pointer
                       hover:border-brand-yellow/40 hover:bg-white/5 transition-all group"
          >
            <Upload className="w-7 h-7 text-white/30 group-hover:text-brand-yellow mx-auto mb-2 transition-colors" />
            <p className="text-white/40 text-sm">
              Drop screenshots here or <span className="text-brand-yellow">browse</span>
            </p>
            <p className="text-white/25 text-xs mt-1">PNG, JPG, WEBP · max 10 MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => handleFileChange(e.target.files)}
            />
          </div>

          {/* Previews */}
          <AnimatePresence>
            {imagePreviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-3 mt-3 flex-wrap"
              >
                {imagePreviews.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1,   opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10"
                  >
                    <Image src={src} alt={`screenshot ${i + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
                {images.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-white/15 flex items-center
                               justify-center text-white/30 hover:border-brand-yellow/40 hover:text-brand-yellow transition-all"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Fitness App Data ───────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.16 }}
          className="sz-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFitnessData(!showFitnessData)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-semibold text-sm">Fitness App Data</p>
                <p className="text-xs text-white/40">Import stats from Strava, Garmin, Apple Health…</p>
              </div>
            </div>
            {showFitnessData
              ? <ChevronUp className="w-5 h-5 text-white/40" />
              : <ChevronDown className="w-5 h-5 text-white/40" />
            }
          </button>

          <AnimatePresence>
            {showFitnessData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">

                  {/* Source selector */}
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-2">Data Source</label>
                    <div className="flex flex-wrap gap-2">
                      {FITNESS_SOURCES.map(src => (
                        <button
                          key={src} type="button"
                          onClick={() => setFitnessSource(src)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            ${fitnessSource === src
                              ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HR row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-400" /> Avg HR (bpm)
                      </label>
                      <input
                        type="number" min="40" max="250"
                        value={heartRateAvg} onChange={e => setHeartRateAvg(e.target.value)}
                        placeholder="145"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                                   placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500" /> Max HR (bpm)
                      </label>
                      <input
                        type="number" min="40" max="250"
                        value={heartRateMax} onChange={e => setHeartRateMax(e.target.value)}
                        placeholder="185"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                                   placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors"
                      />
                    </div>
                  </div>

                  {/* Calories + Steps */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories (kcal)
                      </label>
                      <input
                        type="number" min="0"
                        value={calories} onChange={e => setCalories(e.target.value)}
                        placeholder="420"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                                   placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-1.5">
                        <Footprints className="w-3.5 h-3.5 text-blue-400" /> Steps
                      </label>
                      <input
                        type="number" min="0"
                        value={steps} onChange={e => setSteps(e.target.value)}
                        placeholder="8500"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                                   placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors"
                      />
                    </div>
                  </div>

                  {/* Pace + Elevation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-1.5">
                        <Timer className="w-3.5 h-3.5 text-green-400" /> Pace (min/km)
                      </label>
                      <input
                        type="text"
                        value={pace} onChange={e => setPace(e.target.value)}
                        placeholder="5:30"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                                   placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 mb-1.5">
                        <Mountain className="w-3.5 h-3.5 text-purple-400" /> Elevation (m)
                      </label>
                      <input
                        type="number" min="0"
                        value={elevationGain} onChange={e => setElevationGain(e.target.value)}
                        placeholder="120"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                                   placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-white/30 flex items-center gap-1.5">
                    ℹ️ These stats are stored with your activity and shown on your profile. Direct app sync coming soon.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Plausibility Warnings ─────────────────────────────────────────── */}
        <AnimatePresence>
          {plausibilityWarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {plausibilityWarnings.map((w, i) => (
                <div key={i} className={`rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2 ${
                  w.severity === 'error'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-yellow-400/10 border border-yellow-400/20 text-yellow-300'
                }`}>
                  <span>{w.severity === 'error' ? '⛔' : '⚠️'}</span>
                  {w.message}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Score Preview ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {previewScore > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="sz-card p-5 border-brand-yellow/20 bg-brand-yellow/5"
            >
              {/* Total */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white/70">
                  <Zap className="w-5 h-5 text-brand-yellow" />
                  <span className="text-sm font-semibold">Points Preview</span>
                </div>
                <p className="text-2xl font-black text-brand-yellow">+{previewScore}</p>
              </div>

              {/* Breakdown rows */}
              <div className="border-t border-white/10 pt-3 space-y-1.5">
                {[
                  { label: 'Base (duration × intensity × sport)', value: scoreBreakdown.basePoints },
                  { label: 'Distance bonus',                       value: scoreBreakdown.distanceBonus },
                  ...(scoreBreakdown.elevationBonus > 0 ? [{ label: 'Elevation bonus', value: scoreBreakdown.elevationBonus }] : []),
                  ...(scoreBreakdown.caloriesBonus  > 0 ? [{ label: 'Calories bonus',  value: scoreBreakdown.caloriesBonus  }] : []),
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{row.label}</span>
                    <span className="text-white/70 font-semibold">+{row.value}</span>
                  </div>
                ))}
                {scoreBreakdown.sourceVerified && (
                  <div className="flex items-center gap-1.5 text-xs text-green-400 pt-1">
                    <span>✓</span> Verified source (+5% bonus applied)
                  </div>
                )}
                {scoreBreakdown.hrMultiplier > 1.0 && (
                  <div className="flex items-center gap-1.5 text-xs text-red-300 pt-0">
                    <span>♥</span> HR zone bonus (×{scoreBreakdown.hrMultiplier})
                  </div>
                )}
                {scoreBreakdown.durationDamped && (
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400/70 pt-0">
                    <span>⏱</span> Ultra-duration damper applied (×0.85)
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <motion.button
          type="submit"
          disabled={submitting}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full text-lg"
        >
          {uploadProgress
            ? 'Uploading images…'
            : submitting
              ? 'Logging…'
              : 'Log Activity'
          }
        </motion.button>

      </form>
    </div>
  )
}
