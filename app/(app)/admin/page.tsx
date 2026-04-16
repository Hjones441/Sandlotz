'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { seedPerks, seedChallenges } from '@/lib/firestore'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

const FOUNDER_EMAIL = 'Hjones441@gmail.com'

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [seeding,        setSeeding]        = useState(false)
  const [seedingChall,   setSeedingChall]   = useState(false)
  const [perksSeeded,    setPerksSeeded]    = useState(false)
  const [challSeeded,    setChallSeeded]    = useState(false)
  const [error,          setError]          = useState('')

  // Access control
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-yellow/60" />
      </div>
    )
  }
  if (!user || profile?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="sz-card p-8 max-w-sm w-full text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-black text-white mb-1">Access Denied</h2>
          <p className="text-white/50 text-sm mb-5">This page is restricted to the Sandlotz founder account.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary w-full">Back to Dashboard</button>
        </div>
      </div>
    )
  }

  async function handleSeedPerks() {
    setError('')
    setSeeding(true)
    try {
      await seedPerks()
      setPerksSeeded(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to seed perks.')
    } finally {
      setSeeding(false)
    }
  }

  async function handleSeedChallenges() {
    setError('')
    setSeedingChall(true)
    try {
      await seedChallenges()
      setChallSeeded(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to seed challenges.')
    } finally {
      setSeedingChall(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-8 h-8 text-brand-yellow" />
        <div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm">Sandlotz Founder Controls</p>
        </div>
      </div>

      <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl px-4 py-3 mb-6">
        <p className="text-brand-yellow/80 text-xs font-semibold">
          ⚠️ Seed actions write directly to Firestore. Do not run more than once per collection or duplicates will be created.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
          {error}
        </div>
      )}

      <div className="space-y-4">

        {/* Seed Perks */}
        <div className="sz-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white font-bold mb-1">Seed Perks Store</h3>
              <p className="text-white/50 text-sm">Writes 8 perks (Nike, GNC, Columbus FC, FitLab, SportChek, Sandlotz Pro, Garmin, CoachHub) to Firestore.</p>
            </div>
            {perksSeeded && <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />}
          </div>
          <button
            onClick={handleSeedPerks}
            disabled={seeding || perksSeeded}
            className="mt-4 btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {seeding
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Seeding…</>
              : perksSeeded
              ? <><CheckCircle2 className="w-4 h-4" /> Perks Seeded</>
              : '🎁 Seed 8 Perks'
            }
          </button>
        </div>

        {/* Seed Challenges */}
        <div className="sz-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white font-bold mb-1">Seed Challenges</h3>
              <p className="text-white/50 text-sm">Writes 4 challenges (30-Day Run Streak, Columbus 100K, Summer Swim Series, 500-Min Grind) to Firestore.</p>
            </div>
            {challSeeded && <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />}
          </div>
          <button
            onClick={handleSeedChallenges}
            disabled={seedingChall || challSeeded}
            className="mt-4 btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {seedingChall
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Seeding…</>
              : challSeeded
              ? <><CheckCircle2 className="w-4 h-4" /> Challenges Seeded</>
              : '🏆 Seed 4 Challenges'
            }
          </button>
        </div>

      </div>
    </div>
  )
}
