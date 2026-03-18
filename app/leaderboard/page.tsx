'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLeaderboard, LeaderboardEntry } from '@/lib/firestore'
import { SPORT_OPTIONS, formatScore, getRankTier } from '@/lib/sandlotzScore'
import { Trophy, Medal } from 'lucide-react'
import Image from 'next/image'

const CITIES = ['Columbus', 'Cleveland', 'Cincinnati', 'Dayton', 'Toledo']

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return <span className="w-8 text-center font-black text-white/40 text-sm">#{rank}</span>
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  if (entry.photoURL) {
    return (
      <Image
        src={entry.photoURL}
        alt={entry.displayName}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center
                    text-brand-yellow font-black text-sm">
      {entry.displayName?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function LeaderboardPage() {
  const { user, profile } = useAuth()
  const [entries,      setEntries]      = useState<LeaderboardEntry[]>([])
  const [loading,      setLoading]      = useState(true)
  const [city,         setCity]         = useState('Columbus')
  const [sportFilter,  setSportFilter]  = useState('all')

  useEffect(() => {
    setLoading(true)
    getLeaderboard(city, sportFilter)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [city, sportFilter])

  const myRank = entries.findIndex(e => e.uid === user?.uid) + 1

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-8 h-8 text-brand-yellow" />
        <h1 className="text-3xl font-black">Leaderboard</h1>
      </div>
      <p className="text-white/50 mb-8">Top performers ranked by Sandlotz Score™</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* City filter */}
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm
                     focus:outline-none focus:border-brand-yellow transition-colors"
        >
          {CITIES.map(c => (
            <option key={c} value={c} className="bg-brand-purple-dark">{c}</option>
          ))}
        </select>

        {/* Sport filter */}
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm
                     focus:outline-none focus:border-brand-yellow transition-colors"
        >
          <option value="all" className="bg-brand-purple-dark">All Sports</option>
          {SPORT_OPTIONS.map(s => (
            <option key={s.value} value={s.value} className="bg-brand-purple-dark">
              {s.emoji} {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* My rank banner */}
      {user && myRank > 0 && (
        <div className="sz-card p-4 mb-6 flex items-center justify-between
                        border-brand-yellow/20 bg-brand-yellow/5">
          <div className="flex items-center gap-3">
            <Medal className="w-5 h-5 text-brand-yellow" />
            <span className="font-semibold text-sm">Your Rank</span>
          </div>
          <span className="font-black text-brand-yellow text-lg">#{myRank}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="sz-card p-12 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin mx-auto" />
        </div>
      ) : entries.length === 0 ? (
        <div className="sz-card p-12 text-center">
          <p className="text-white/40 text-lg">No athletes yet in {city}.</p>
          <p className="text-white/30 text-sm mt-2">Log an activity to be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const tier   = getRankTier(entry.totalScore)
            const isMe   = entry.uid === user?.uid
            const rank   = i + 1

            return (
              <div
                key={entry.uid}
                className={`sz-card p-4 flex items-center gap-4 transition-all
                  ${isMe ? 'border-brand-yellow/40 bg-brand-yellow/5' : 'hover:bg-white/5'}`}
              >
                {/* Rank */}
                <div className="w-10 flex justify-center shrink-0">
                  <RankBadge rank={rank} />
                </div>

                {/* Avatar */}
                <Avatar entry={entry} />

                {/* Name + tier */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold truncate ${isMe ? 'text-brand-yellow' : 'text-white'}`}>
                      {entry.displayName}
                      {isMe && <span className="text-xs ml-1">(you)</span>}
                    </p>
                  </div>
                  <p className={`text-xs font-semibold ${tier.color}`}>{tier.label}</p>
                </div>

                {/* Sport */}
                <div className="shrink-0 text-lg">
                  {SPORT_OPTIONS.find(s => s.value === entry.sport)?.emoji ?? '🏅'}
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <p className="font-black text-brand-yellow">{formatScore(entry.totalScore)}</p>
                  <p className="text-white/30 text-xs">pts</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
