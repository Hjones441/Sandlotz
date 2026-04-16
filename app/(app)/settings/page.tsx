'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { updateUserProfile } from '@/lib/firestore'
import { SPORT_OPTIONS } from '@/lib/sandlotzScore'
import AppHeader from '@/components/layout/AppHeader'
import { Save, Loader2, CheckCircle } from 'lucide-react'

const CITIES = [
  'Columbus', 'New York', 'Los Angeles', 'Chicago', 'Houston',
  'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas',
  'Atlanta', 'Miami', 'Seattle', 'Denver', 'Boston', 'Other',
]

export default function SettingsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [city,        setCity]        = useState('')
  const [sport,       setSport]       = useState('')
  const [bio,         setBio]         = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '')
      setCity(profile.city ?? 'Columbus')
      setSport(profile.sport ?? 'other')
      setBio((profile as any).bio ?? '')
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!displayName.trim()) { setError('Display name is required.'); return }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        city,
        sport,
        bio: bio.trim(),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Settings" subtitle="Edit your profile" />
      </div>

      <div className="px-4 pt-6">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Display Name */}
          <div className="sz-card p-5">
            <h2 className="text-white font-bold mb-4">Profile Info</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={40}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="Tell the community a bit about yourself…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-yellow-400/50 transition-colors resize-none"
                />
                <p className="text-white/30 text-xs mt-1 text-right">{bio.length}/200</p>
              </div>
            </div>
          </div>

          {/* Location & Sport */}
          <div className="sz-card p-5">
            <h2 className="text-white font-bold mb-4">Location & Sport</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  City
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/50 transition-colors appearance-none"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c} className="bg-[#1a1040] text-white">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Primary Sport
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SPORT_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSport(s.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border text-left flex items-center gap-2 ${
                        sport === s.value
                          ? 'bg-yellow-400/20 border-yellow-400/60 text-yellow-300'
                          : 'border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account info (read-only) */}
          <div className="sz-card p-5">
            <h2 className="text-white font-bold mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Email</p>
                <p className="text-white/70 text-sm">{profile.email}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">User ID</p>
                <p className="text-white/40 text-xs font-mono">{user.uid}</p>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle className="w-5 h-5" /> Saved!</>
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
