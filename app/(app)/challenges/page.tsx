'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getChallenges, joinChallenge, getChallengeParticipant, getChallengeLeaderboard } from '@/lib/firestore'
import type { Challenge, ChallengeParticipant } from '@/lib/firestore'
import AppHeader from '@/components/layout/AppHeader'
import {
  Trophy, Zap, Clock, Users, Target, X, Loader2,
  CheckCircle2, Star, Flag,
} from 'lucide-react'
import { SPORT_OPTIONS } from '@/lib/sandlotzScore'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeLeft(endDate: { toDate: () => Date } | undefined): string {
  if (!endDate?.toDate) return ''
  const diff = endDate.toDate().getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0)  return `${days}d ${hours}h left`
  return `${hours}h left`
}

function sportLabel(sport: string): string {
  if (sport === 'all') return 'All Sports'
  return SPORT_OPTIONS.find(s => s.value === sport)?.label ?? sport
}

function sportEmoji(sport: string): string {
  if (sport === 'all') return '🏅'
  return SPORT_OPTIONS.find(s => s.value === sport)?.emoji ?? '🏅'
}

// ─── ChallengeDetailModal ─────────────────────────────────────────────────────

function ChallengeDetailModal({ challenge, onJoin, onClose, joined, joining, myProgress }: {
  challenge: Challenge
  onJoin: () => void
  onClose: () => void
  joined: boolean
  joining: boolean
  myProgress: number
}) {
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([])
  const [lbLoading,   setLbLoading]   = useState(false)

  const pct = challenge.goal > 0 ? Math.min(100, (myProgress / challenge.goal) * 100) : 0

  useEffect(() => {
    if (!challenge.id) return
    setLbLoading(true)
    getChallengeLeaderboard(challenge.id).then(data => {
      setLeaderboard(data)
      setLbLoading(false)
    })
  }, [challenge.id, joined])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-[#120a2e] rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{challenge.emoji}</span>
            <div>
              <h3 className="text-white font-black text-base leading-tight">{challenge.title}</h3>
              <p className="text-white/40 text-xs">{sportEmoji(challenge.sport)} {sportLabel(challenge.sport)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          {/* Description */}
          <p className="text-white/70 text-sm leading-relaxed">{challenge.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Target className="w-4 h-4 text-brand-yellow" />, label: 'Goal', value: `${challenge.goal} ${challenge.goalUnit}` },
              { icon: <Zap    className="w-4 h-4 text-green-400"    />, label: 'Reward', value: `+${challenge.reward} pts` },
              { icon: <Clock  className="w-4 h-4 text-white/50"     />, label: 'Time', value: timeLeft(challenge.endDate as unknown as { toDate: () => Date }) },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-white font-bold text-sm">{s.value}</p>
                <p className="text-white/40 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* My progress (if joined) */}
          {joined && (
            <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">My Progress</span>
                <span className="text-brand-yellow font-black text-sm">{myProgress} / {challenge.goal} {challenge.goalUnit}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <motion.div className="h-2 bg-brand-yellow rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3, duration: 0.6 }} />
              </div>
              {pct >= 100 && (
                <div className="flex items-center gap-2 mt-2 text-green-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Challenge completed! Reward pending.
                </div>
              )}
            </div>
          )}

          {/* Sponsored badge */}
          {challenge.sponsored && challenge.sponsorName && (
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5">
              <Star className="w-4 h-4 text-brand-yellow" />
              <p className="text-white/60 text-xs">Sponsored by <span className="text-white font-bold">{challenge.sponsorName}</span></p>
            </div>
          )}

          {/* Leaderboard */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-brand-yellow" />
              <span className="text-white font-bold text-sm">Participants</span>
              {!lbLoading && <span className="text-white/40 text-xs">({leaderboard.length})</span>}
            </div>
            {lbLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
            ) : leaderboard.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">Be the first to join!</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {leaderboard.slice(0, 10).map((p, i) => (
                  <div key={p.id ?? p.uid} className="flex items-center gap-3">
                    <span className={`text-xs font-black w-5 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/60' : i === 2 ? 'text-orange-400' : 'text-white/30'}`}>
                      {i + 1}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {p.displayName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="flex-1 text-white text-xs truncate">{p.displayName}</span>
                    <span className="text-white/60 text-xs font-semibold">{p.progress} {challenge.goalUnit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Join button */}
          {!joined ? (
            <button onClick={onJoin} disabled={joining}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {joining
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</>
                : <><Flag className="w-4 h-4" /> Join Challenge</>
              }
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-400 py-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-sm">You&apos;re in!</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const { user, profile } = useAuth()

  const [challenges,     setChallenges]     = useState<Challenge[]>([])
  const [loading,        setLoading]        = useState(true)
  const [sportFilter,    setSportFilter]    = useState('all')
  const [selected,       setSelected]       = useState<Challenge | null>(null)
  const [joinStatus,     setJoinStatus]     = useState<Record<string, boolean>>({})   // challengeId → joined
  const [progressMap,    setProgressMap]    = useState<Record<string, number>>({})    // challengeId → progress
  const [joining,        setJoining]        = useState(false)
  const [error,          setError]          = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getChallenges()
      setChallenges(data)
      // Check join status for each challenge (if logged in)
      if (user) {
        const statuses: Record<string, boolean> = {}
        const progress: Record<string, number>  = {}
        await Promise.all(
          data.map(async c => {
            if (!c.id) return
            const p = await getChallengeParticipant(c.id, user.uid)
            statuses[c.id] = !!p
            progress[c.id] = p?.progress ?? 0
          })
        )
        setJoinStatus(statuses)
        setProgressMap(progress)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleJoin() {
    if (!user || !profile || !selected?.id) return
    setJoining(true)
    setError('')
    try {
      await joinChallenge(selected.id, user.uid, profile.displayName, profile.photoURL ?? null)
      setJoinStatus(s => ({ ...s, [selected.id!]: true }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join.')
    } finally {
      setJoining(false)
    }
  }

  const sportOptions = [
    { value: 'all', label: 'All', emoji: '🏅' },
    ...SPORT_OPTIONS.filter(s => challenges.some(c => c.sport === s.value || c.sport === 'all')),
  ]

  const filtered = challenges.filter(c =>
    sportFilter === 'all' || c.sport === 'all' || c.sport === sportFilter
  )

  const active  = filtered.filter(c => {
    const end = (c.endDate as unknown as { toDate?: () => Date })?.toDate?.()
    return !end || end > new Date()
  })
  const ended   = filtered.filter(c => {
    const end = (c.endDate as unknown as { toDate?: () => Date })?.toDate?.()
    return end && end <= new Date()
  })

  return (
    <>
      <div className="max-w-5xl mx-auto pb-4">
        <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
          <AppHeader title="Challenges" subtitle="Compete · earn bonus points · win rewards"
            right={<Trophy className="w-5 h-5 text-brand-yellow" />} />
        </div>
        <div className="px-4 pt-4 pb-24">

          {/* Sport filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            {sportOptions.map(s => (
              <button key={s.value} onClick={() => setSportFilter(s.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  sportFilter === s.value
                    ? 'bg-brand-yellow text-brand-purple-dark'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}>
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-yellow/60" />
            </div>
          ) : active.length === 0 && ended.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 mb-1">No challenges yet.</p>
              <p className="text-white/25 text-sm">Check back soon — sponsor challenges drop weekly.</p>
            </div>
          ) : (
            <>
              {/* Active challenges */}
              {active.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <h2 className="text-white font-bold">Active Challenges</h2>
                    <span className="text-white/40 text-sm">({active.length})</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {active.map(challenge => {
                      const isJoined = challenge.id ? joinStatus[challenge.id] : false
                      const progress = challenge.id ? progressMap[challenge.id] ?? 0 : 0
                      const pct = challenge.goal > 0 ? Math.min(100, (progress / challenge.goal) * 100) : 0
                      const tl  = timeLeft(challenge.endDate as unknown as { toDate: () => Date })
                      const urgent = tl.includes('h left') && !tl.includes('d')

                      return (
                        <motion.button key={challenge.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelected(challenge)}
                          className="sz-card p-5 text-left hover:border-brand-yellow/30 transition-colors group">

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{challenge.emoji}</span>
                              <div>
                                <p className="text-white font-bold leading-tight group-hover:text-brand-yellow transition-colors">
                                  {challenge.title}
                                </p>
                                <p className="text-white/40 text-xs mt-0.5">
                                  {sportEmoji(challenge.sport)} {sportLabel(challenge.sport)}
                                </p>
                              </div>
                            </div>
                            {isJoined && (
                              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                            )}
                          </div>

                          <p className="text-white/60 text-xs mb-3 line-clamp-2 leading-relaxed">
                            {challenge.description}
                          </p>

                          {/* Progress bar (if joined) */}
                          {isJoined && (
                            <div className="mb-3">
                              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                                <span>My progress</span>
                                <span>{progress} / {challenge.goal} {challenge.goalUnit}</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full">
                                <div className="h-1.5 bg-brand-yellow rounded-full transition-all"
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400 text-xs font-bold">+{challenge.reward} pts</span>
                              </div>
                              {challenge.sponsored && challenge.sponsorName && (
                                <span className="text-xs text-brand-yellow/60 bg-brand-yellow/10 px-2 py-0.5 rounded-full">
                                  {challenge.sponsorName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className={`w-3.5 h-3.5 ${urgent ? 'text-orange-400' : 'text-white/30'}`} />
                              <span className={`text-xs ${urgent ? 'text-orange-400 font-bold' : 'text-white/30'}`}>{tl}</span>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Ended challenges */}
              {ended.length > 0 && (
                <div>
                  <h2 className="text-white/40 font-bold mb-4">Ended</h2>
                  <div className="grid sm:grid-cols-2 gap-4 opacity-60">
                    {ended.map(challenge => (
                      <div key={challenge.id} className="sz-card p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{challenge.emoji}</span>
                          <div>
                            <p className="text-white/60 font-bold text-sm">{challenge.title}</p>
                            <p className="text-white/30 text-xs">Challenge ended</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-white/30 text-xs">+{challenge.reward} pts reward</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <ChallengeDetailModal
            challenge={selected}
            onJoin={handleJoin}
            onClose={() => { setSelected(null); setError('') }}
            joined={selected.id ? joinStatus[selected.id] ?? false : false}
            joining={joining}
            myProgress={selected.id ? progressMap[selected.id] ?? 0 : 0}
          />
        )}
      </AnimatePresence>
    </>
  )
}
