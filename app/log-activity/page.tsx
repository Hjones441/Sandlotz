'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
import { TERRA_APPS } from '@/lib/terra'
import type { TerraActivity } from '@/lib/terra'
import {
  Zap, Upload, X, Heart, Flame, Footprints, Mountain, Timer,
  ChevronDown, ChevronUp, Image as ImageIcon, Link2, RefreshCw,
  CheckCircle2, Plus, ArrowRight, Wifi,
} from 'lucide-react'

// ─── Animation variants ───────────────────────────────────────────────────────
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LogActivityPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  // ── Core form state ──────────────────────────────────────────────────────
  const [sport,        setSport]        = useState<SportType>('running')
  const [duration,     setDuration]     = useState('')
  const [distance,     setDistance]     = useState('')
  const [intensity,    setIntensity]    = useState(3)
  const [notes,        setNotes]        = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [earned,       setEarned]       = useState<number | null>(null)
  const [error,        setError]        = useState('')

  // ── Image upload ──────────────────────────────────────────────────────────
  const fileInputRef                    = useRef<HTMLInputElement>(null)
  const [images,       setImages]       = useState<File[]>([])
  const [imagePreviews,setImagePreviews]= useState<string[]>([])
  const [uploadingImgs,setUploadingImgs]= useState(false)

  // ── Fitness data ──────────────────────────────────────────────────────────
  const [showFitness,  setShowFitness]  = useState(false)
  const [fitSource,    setFitSource]    = useState('Manual')
  const [hrAvg,        setHrAvg]        = useState('')
  const [hrMax,        setHrMax]        = useState('')
  const [calories,     setCalories]     = useState('')
  const [steps,        setSteps]        = useState('')
  const [pace,         setPace]         = useState('')
  const [elevation,    setElevation]    = useState('')

  // ── Terra / multi-app state ───────────────────────────────────────────────
  const [terraConnected,  setTerraConnected]  = useState(false)
  const [terraProviders,  setTerraProviders]  = useState<string[]>([])
  const [terraActivities, setTerraActivities] = useState<TerraActivity[]>([])
  const [terraLoading,    setTerraLoading]    = useState(false)
  const [showImportList,  setShowImportList]  = useState(false)
  const [connectingTerra, setConnectingTerra] = useState(false)
  const [importedFrom,    setImportedFrom]    = useState<string | null>(null)

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // ── Check Terra connection on mount ──────────────────────────────────────
  const fetchTerra = useCallback(async () => {
    if (!user) return
    setTerraLoading(true)
    try {
      const res = await fetch(`/api/terra/activities?uid=${user.uid}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.connected) {
        setTerraConnected(true)
        setTerraProviders(data.providers ?? [])
        setTerraActivities(data.activities ?? [])
      }
    } catch {
      // silent — user can still log manually
    } finally {
      setTerraLoading(false)
    }
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('terra') === 'connected') {
      window.history.replaceState({}, '', '/log-activity')
      setTerraConnected(true)
    }
    fetchTerra()
  }, [fetchTerra])

  // ── Connect Terra (opens widget) ──────────────────────────────────────────
  async function connectTerra() {
    if (!user) return
    setConnectingTerra(true)
    try {
      const res = await fetch('/api/terra/widget-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ referenceId: user.uid }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Could not open Terra widget.')
      }
    } catch {
      setError('Failed to connect. Check Terra API config.')
    } finally {
      setConnectingTerra(false)
    }
  }

  // ── Auto-populate form from Terra activity ────────────────────────────────
  function importActivity(act: TerraActivity) {
    setSport((act.sport as SportType) || 'other')
    setDuration(String(act.durationMinutes))
    setDistance(String(act.distanceKm))
    setNotes(act.name ?? '')
    setFitSource(act.provider)
    if (act.heartRateAvg)  setHrAvg(String(act.heartRateAvg))
    if (act.heartRateMax)  setHrMax(String(act.heartRateMax))
    if (act.calories)      setCalories(String(act.calories))
    if (act.elevationGain) setElevation(String(act.elevationGain))
    if (act.paceMinPerKm)  setPace(act.paceMinPerKm)
    setShowFitness(true)
    setShowImportList(false)
    setImportedFrom(act.provider)
    // Auto-set intensity from HR
    if (act.heartRateAvg) {
      if      (act.heartRateAvg >= 170) setIntensity(5)
      else if (act.heartRateAvg >= 150) setIntensity(4)
      else if (act.heartRateAvg >= 130) setIntensity(3)
      else                               setIntensity(2)
    }
  }

  // ── Image handling ────────────────────────────────────────────────────────
  function handleFileChange(files: FileList | null) {
    if (!files) return
    const newFiles  = Array.from(files).filter(f => f.type.startsWith('image/'))
    const combined  = [...images, ...newFiles].slice(0, 4)
    setImages(combined)
    setImagePreviews(combined.map(f => URL.createObjectURL(f)))
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Score calculations ────────────────────────────────────────────────────
  const fitnessScoringData = showFitness
    ? { source: fitSource, heartRateAvg: hrAvg ? Number(hrAvg) : undefined,
        elevationGain: elevation ? Number(elevation) : undefined,
        calories: calories ? Number(calories) : undefined }
    : undefined

  const breakdown: ScoreBreakdown = calculateActivityScoreDetailed(
    sport, Number(duration) || 0, Number(distance) || 0, intensity, fitnessScoringData,
  )

  const warnings = showFitness && fitnessScoringData
    ? validateFitnessData(Number(duration) || 0, fitnessScoringData)
    : []

  // ── Build fitness data object for Firestore ───────────────────────────────
  function buildFitnessData(): FitnessData | undefined {
    const hasData = hrAvg || hrMax || calories || steps || pace || elevation
    if (!hasData) return undefined
    return {
      source:        fitSource,
      heartRateAvg:  hrAvg      ? Number(hrAvg)      : undefined,
      heartRateMax:  hrMax      ? Number(hrMax)       : undefined,
      calories:      calories   ? Number(calories)    : undefined,
      steps:         steps      ? Number(steps)       : undefined,
      pace:          pace       || undefined,
      elevationGain: elevation  ? Number(elevation)   : undefined,
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    if (!duration || Number(duration) <= 0) { setError('Please enter a valid duration.'); return }
    if (warnings.some(w => w.severity === 'error')) { setError('Fix the errors above before submitting.'); return }

    setError('')
    setSubmitting(true)
    setUploadingImgs(images.length > 0)

    try {
      const imageUrls: string[] = []
      for (const file of images) imageUrls.push(await uploadActivityImage(user.uid, file))
      setUploadingImgs(false)

      const pts = await logActivity({
        uid: user.uid, sport,
        durationMinutes: Number(duration),
        distanceKm:      Number(distance) || 0,
        intensity, notes,
        city:        profile.city ?? 'Columbus',
        displayName: profile.displayName,
        photoURL:    profile.photoURL ?? null,
        imageUrls:   imageUrls.length > 0 ? imageUrls : undefined,
        fitnessData: buildFitnessData(),
      })
      await refreshProfile()
      setEarned(pts)
    } catch (err: unknown) {
      setUploadingImgs(false)
      setError(err instanceof Error ? err.message : 'Failed to log activity.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setEarned(null); setSport('running'); setDuration(''); setDistance('')
    setIntensity(3); setNotes(''); setImages([]); setImagePreviews([])
    setHrAvg(''); setHrMax(''); setCalories(''); setSteps(''); setPace('')
    setElevation(''); setShowFitness(false); setFitSource('Manual')
    setImportedFrom(null)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
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
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="sz-card p-12 max-w-sm w-full text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
            className="text-6xl mb-4">🏆</motion.div>
          <h2 className="text-3xl font-black mb-2">Activity Logged!</h2>
          <p className="text-white/50 mb-4">You earned</p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-6xl font-black text-brand-yellow mb-1">+{earned}</motion.p>
          <p className="text-brand-yellow font-bold mb-2">PlayerPoints</p>
          {importedFrom && (
            <p className="text-white/40 text-xs mb-4">Imported from {importedFrom} · Verified source bonus applied</p>
          )}
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
            <button onClick={reset} className="btn-primary">Log Another</button>
            <button onClick={() => router.push('/dashboard')} className="btn-ghost">Back to Dashboard</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-28">

      <motion.div variants={FADE_UP} initial="hidden" animate="show" className="mb-8">
        <h1 className="text-3xl font-black text-white">Post Activity</h1>
        <p className="text-white/50 text-sm mt-1">Log a workout and earn PlayerPoints</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── STEP 1: App Import Hub ─────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.04 }}>
          <div className="sz-card overflow-hidden">

            {/* Header row */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-sm text-white">Import from App</span>
                {terraConnected && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                    {terraProviders.length} connected
                  </span>
                )}
              </div>
              {terraConnected && (
                <button type="button" onClick={fetchTerra} disabled={terraLoading}
                  className="text-white/40 hover:text-white transition-colors">
                  <RefreshCw className={`w-4 h-4 ${terraLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* App tiles */}
            <div className="p-4">
              {terraConnected ? (
                /* Connected — show provider badges + import button */
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {TERRA_APPS.filter(a => terraProviders.includes(a.id)).map(app => (
                      <span key={app.id}
                        style={{ borderColor: app.color + '40', backgroundColor: app.color + '15' }}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border text-white">
                        <span>{app.icon}</span>{app.label}
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      </span>
                    ))}
                    <button type="button" onClick={connectTerra} disabled={connectingTerra}
                      className="flex items-center gap-1 text-xs text-white/40 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 px-3 py-1.5 rounded-full transition-all">
                      <Plus className="w-3 h-3" /> Add App
                    </button>
                  </div>

                  {/* Import button */}
                  <button type="button"
                    onClick={() => setShowImportList(!showImportList)}
                    className="w-full flex items-center justify-between bg-yellow-400/10 hover:bg-yellow-400/15 border border-yellow-400/20 rounded-xl px-4 py-3 transition-all group">
                    <span className="text-yellow-400 font-bold text-sm">
                      Import Recent Activity
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400/60 text-xs">{terraActivities.length} available</span>
                      <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              ) : (
                /* Not connected — show connect grid */
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {TERRA_APPS.filter(a => a.webReady).slice(0, 8).map(app => (
                      <div key={app.id}
                        style={{ borderColor: app.color + '30' }}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border bg-white/5 opacity-50">
                        <span className="text-xl">{app.icon}</span>
                        <span className="text-white/60 text-[10px] font-semibold text-center leading-tight">{app.label}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={connectTerra} disabled={connectingTerra}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/30 rounded-xl py-3 transition-all group">
                    {connectingTerra
                      ? <RefreshCw className="w-4 h-4 animate-spin text-white/40" />
                      : <Link2 className="w-4 h-4 text-yellow-400" />}
                    <span className="text-white font-semibold text-sm">
                      {connectingTerra ? 'Opening...' : 'Connect Strava, Garmin, Whoop & more'}
                    </span>
                    <span className="text-yellow-400 text-xs font-bold ml-auto">+5% bonus →</span>
                  </button>
                  <p className="text-white/30 text-xs text-center">
                    Supports 12+ platforms · Auto-fills your stats · No manual entry
                  </p>
                </div>
              )}
            </div>

            {/* Activity list dropdown */}
            <AnimatePresence>
              {showImportList && terraActivities.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/10">
                  <div className="max-h-60 overflow-y-auto">
                    {terraActivities.map((act, i) => {
                      const app = TERRA_APPS.find(a => a.id === act.provider)
                      const dateStr = new Date(act.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      return (
                        <button key={act.terraId ?? i} type="button" onClick={() => importActivity(act)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 group">
                          <span className="text-lg shrink-0">{app?.icon ?? '🏅'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{act.name ?? act.sport}</p>
                            <p className="text-white/40 text-xs">
                              {dateStr} · {act.durationMinutes}min
                              {act.distanceKm > 0 ? ` · ${act.distanceKm}km` : ''}
                              {act.heartRateAvg ? ` · ${act.heartRateAvg}bpm` : ''}
                              {act.calories ? ` · ${act.calories}kcal` : ''}
                            </p>
                          </div>
                          <span className="text-yellow-400 text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            Import →
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Imported banner */}
          <AnimatePresence>
            {importedFrom && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-green-400 text-xs font-semibold">
                  Imported from {importedFrom} — all fields auto-filled. Edit anything below.
                </p>
                <button type="button" onClick={() => setImportedFrom(null)} className="ml-auto text-white/30 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── STEP 2: Sport picker ───────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.07 }}>
          <label className="block text-sm font-semibold text-white/60 mb-2">Sport</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {SPORT_OPTIONS.map(s => (
              <motion.button type="button" key={s.value} onClick={() => setSport(s.value)}
                whileTap={{ scale: 0.93 }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all
                  ${sport === s.value
                    ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}>
                <span className="text-lg">{s.emoji}</span>
                <span className="text-[10px] leading-tight text-center">{s.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── STEP 3: Duration + Distance ───────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.09 }}
          className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">
              Duration <span className="text-white/30">(min)</span>
            </label>
            <input type="number" min="1" max="600" required
              value={duration} onChange={e => setDuration(e.target.value)}
              placeholder="45"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">
              Distance <span className="text-white/30">(km)</span>
            </label>
            <input type="number" min="0" step="0.1"
              value={distance} onChange={e => setDistance(e.target.value)}
              placeholder="5.0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors" />
          </div>
        </motion.div>

        {/* ── STEP 4: Intensity ─────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.11 }}>
          <label className="block text-sm font-semibold text-white/60 mb-2">
            Intensity — <span className="text-brand-yellow">{INTENSITY_LABELS[intensity]}</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1,2,3,4,5].map(i => (
              <motion.button type="button" key={i} onClick={() => setIntensity(i)} whileTap={{ scale: 0.9 }}
                className={`py-3 rounded-xl border text-sm font-black transition-all
                  ${intensity === i
                    ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}>{i}</motion.button>
            ))}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-white/30">Easy</span>
            <span className="text-xs text-white/30">Max Effort</span>
          </div>
        </motion.div>

        {/* ── Notes ─────────────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
          <label className="block text-sm font-semibold text-white/60 mb-2">
            Notes <span className="text-white/30">(optional)</span>
          </label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Morning run, felt great…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors resize-none" />
        </motion.div>

        {/* ── Screenshots ───────────────────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.13 }}>
          <label className="block text-sm font-semibold text-white/60 mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> Screenshots <span className="text-white/30">(up to 4)</span>
          </label>
          <div onClick={() => fileInputRef.current?.click()}
            onDrop={e => { e.preventDefault(); handleFileChange(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-white/15 rounded-xl p-5 text-center cursor-pointer hover:border-yellow-400/40 hover:bg-white/5 transition-all group">
            <Upload className="w-6 h-6 text-white/30 group-hover:text-brand-yellow mx-auto mb-1.5 transition-colors" />
            <p className="text-white/40 text-sm">Drop screenshots or <span className="text-brand-yellow">browse</span></p>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={e => handleFileChange(e.target.files)} />
          </div>
          <AnimatePresence>
            {imagePreviews.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                    <Image src={src} alt="" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 hover:bg-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center text-white/30 hover:border-yellow-400/40 hover:text-yellow-400 transition-all">
                    <Upload className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Fitness data (collapsible) ─────────────────────────────────── */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" transition={{ delay: 0.14 }}
          className="sz-card overflow-hidden">
          <button type="button" onClick={() => setShowFitness(!showFitness)}
            className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-semibold text-sm text-white">
                  Fitness Data
                  {fitSource !== 'Manual' && showFitness && (
                    <span className="ml-2 text-xs text-green-400 font-normal">· {fitSource} ✓</span>
                  )}
                </p>
                <p className="text-xs text-white/40">HR · calories · elevation · pace</p>
              </div>
            </div>
            {showFitness
              ? <ChevronUp className="w-4 h-4 text-white/40" />
              : <ChevronDown className="w-4 h-4 text-white/40" />}
          </button>

          <AnimatePresence>
            {showFitness && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/10">

                  {/* Source chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {['Manual','Strava','Garmin','Apple Health','Polar','Wahoo','Whoop','Oura','Other'].map(src => (
                      <button key={src} type="button" onClick={() => setFitSource(src)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all
                          ${fitSource === src
                            ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}>{src}</button>
                    ))}
                  </div>

                  {/* HR row */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Avg HR (bpm)', val: hrAvg, set: setHrAvg, icon: <Heart className="w-3 h-3 text-red-400" />, ph: '145' },
                      { label: 'Max HR (bpm)', val: hrMax, set: setHrMax, icon: <Heart className="w-3 h-3 text-red-500" />, ph: '185' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="flex items-center gap-1 text-xs font-semibold text-white/50 mb-1.5">{f.icon}{f.label}</label>
                        <input type="number" min="40" max="250" value={f.val} onChange={e => f.set(e.target.value)}
                          placeholder={f.ph}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors" />
                      </div>
                    ))}
                  </div>

                  {/* Calories + Steps */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Calories (kcal)', val: calories, set: setCalories, icon: <Flame className="w-3 h-3 text-orange-400" />, ph: '420' },
                      { label: 'Steps',           val: steps,    set: setSteps,    icon: <Footprints className="w-3 h-3 text-blue-400" />, ph: '8500' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="flex items-center gap-1 text-xs font-semibold text-white/50 mb-1.5">{f.icon}{f.label}</label>
                        <input type="number" min="0" value={f.val} onChange={e => f.set(e.target.value)}
                          placeholder={f.ph}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors" />
                      </div>
                    ))}
                  </div>

                  {/* Pace + Elevation */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Pace (min/km)', val: pace,      set: setPace,      icon: <Timer    className="w-3 h-3 text-green-400"  />, ph: '5:30', type: 'text' },
                      { label: 'Elevation (m)', val: elevation, set: setElevation, icon: <Mountain className="w-3 h-3 text-purple-400" />, ph: '120',  type: 'number' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="flex items-center gap-1 text-xs font-semibold text-white/50 mb-1.5">{f.icon}{f.label}</label>
                        <input type={f.type} min="0" value={f.val} onChange={e => f.set(e.target.value)}
                          placeholder={f.ph}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-yellow transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Plausibility warnings ─────────────────────────────────────── */}
        <AnimatePresence>
          {warnings.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className={`rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 ${
                  w.severity === 'error'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-yellow-400/10 border border-yellow-400/20 text-yellow-300'}`}>
                  {w.severity === 'error' ? '⛔' : '⚠️'} {w.message}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Score preview ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {breakdown.total > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="sz-card p-4 border-brand-yellow/20 bg-brand-yellow/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-yellow" />
                  <span className="text-sm font-bold text-white">Points Preview</span>
                </div>
                <span className="text-2xl font-black text-brand-yellow">+{breakdown.total}</span>
              </div>
              <div className="border-t border-white/10 pt-2.5 space-y-1.5">
                {[
                  { label: 'Base (duration × intensity × sport)', value: breakdown.basePoints },
                  { label: 'Distance bonus', value: breakdown.distanceBonus },
                  ...(breakdown.elevationBonus > 0 ? [{ label: 'Elevation bonus', value: breakdown.elevationBonus }] : []),
                  ...(breakdown.caloriesBonus  > 0 ? [{ label: 'Calories bonus',  value: breakdown.caloriesBonus  }] : []),
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-white/50">{row.label}</span>
                    <span className="text-white/70 font-semibold">+{row.value}</span>
                  </div>
                ))}
                {breakdown.sourceVerified && (
                  <p className="text-xs text-green-400 flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified source (+5% applied)
                  </p>
                )}
                {breakdown.hrMultiplier > 1 && (
                  <p className="text-xs text-red-300">♥ HR zone bonus ×{breakdown.hrMultiplier}</p>
                )}
                {breakdown.durationDamped && (
                  <p className="text-xs text-yellow-400/60">⏱ Ultra-duration damper ×0.85</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
          className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" />
          {uploadingImgs ? 'Uploading images…' : submitting ? 'Logging…' : 'Log Activity & Earn Points'}
        </motion.button>

      </form>
    </div>
  )
}
