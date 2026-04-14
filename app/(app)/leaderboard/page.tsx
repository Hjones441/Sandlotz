'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLeaderboard, LeaderboardEntry } from '@/lib/firestore'
import { SPORT_OPTIONS, formatScore, getRankTier } from '@/lib/sandlotzScore'
import { Trophy, Medal, ChevronDown, Lock, Users, Zap, MapPin, Filter } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import Image from 'next/image'
import Link from 'next/link'

const CITIES = ['New York', 'Columbus', 'Cleveland', 'Cincinnati', 'Dayton', 'Toledo', 'Chicago', 'Los Angeles']

const FAQ_ITEMS = [
  {
    q: 'How is my Sandlotz Score™ calculated?',
    a: 'Your Sandlotz Score™ is based on activity duration, sport multiplier, intensity level, heart rate zone, verified fitness data source, distance, elevation gain, and calories burned. See our full scoring guide for the exact formula.',
  },
  {
    q: 'Why did my rank change overnight?',
    a: 'Leaderboards update in real time as other athletes log activities. Your absolute score never drops, but your relative rank shifts as others log more points.',
  },
  {
    q: 'Can I compete against athletes in other cities?',
    a: 'Yes. The Global leaderboard shows all Sandlotz athletes worldwide. Use the filter to switch between Local, Regional, and Global views.',
  },
  {
    q: 'How do I prevent fraud on the leaderboard?',
    a: 'Every activity goes through our AI anti-cheat stack: source verification, statistical outlier detection, pace plausibility checks, and optional photo evidence. Suspicious entries are flagged and held for review.',
  },
  {
    q: 'What does "Verified" mean on a score?',
    a: 'A verified score comes from a connected fitness app (Strava, Garmin, Apple Health, etc.) and receives a 5% bonus. Manual entries are accepted but do not receive the verified bonus.',
  },
]

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
    <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-yellow-400 font-black text-sm">
      {entry.displayName?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries,     setEntries]     = useState<LeaderboardEntry[]>([])
  const [loading,     setLoading]     = useState(true)
  const [city,        setCity]        = useState('New York')
  const [sportFilter, setSportFilter] = useState('all')
  const [openFaq,     setOpenFaq]     = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    getLeaderboard(city, sportFilter)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [city, sportFilter])

  const myRank = entries.findIndex(e => e.uid === user?.uid) + 1

  return (
    <div className="max-w-4xl mx-auto pb-4">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Leaderboard" subtitle="Ranked by Sandlotz Score™"
          right={<Trophy className="w-5 h-5 text-brand-yellow" />} />
      </div>
      <div className="px-4 pt-4">

      {/* ── Find Your Niche filter card ── */}
      <div className="sz-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-white/60" />
          <span className="text-white font-bold text-sm">Find Your Niche</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* City */}
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> City
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
            >
              {CITIES.map(c => (
                <option key={c} value={c} className="bg-[#1E1040]">{c}</option>
              ))}
            </select>
          </div>

          {/* Sport */}
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Sport
            </label>
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
            >
              <option value="all" className="bg-[#1E1040]">All Sports</option>
              {SPORT_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="bg-[#1E1040]">
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* My rank banner */}
      {user && myRank > 0 && (
        <div className="sz-card p-4 mb-4 flex items-center justify-between border-yellow-400/20 bg-yellow-400/5">
          <div className="flex items-center gap-3">
            <Medal className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-sm text-white">Your Rank in {city}</span>
          </div>
          <span className="font-black text-yellow-400 text-lg">#{myRank}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="sz-card p-12 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : entries.length === 0 ? (
        <div className="sz-card p-12 text-center">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-lg">No athletes yet in {city}.</p>
          <p className="text-white/30 text-sm mt-2">Log an activity to be the first!</p>
          <Link href="/log-activity" className="inline-block mt-4 btn-primary text-sm !py-2 !px-5">
            Log Activity
          </Link>
        </div>
      ) : (
        <div className="space-y-2 mb-10">
          {entries.map((entry, i) => {
            const tier = getRankTier(entry.totalScore)
            const isMe = entry.uid === user?.uid
            const rank = i + 1

            return (
              <div
                key={entry.uid}
                className={`sz-card p-4 flex items-center gap-4 transition-all ${
                  isMe ? 'border-yellow-400/40 bg-yellow-400/5' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 flex justify-center shrink-0">
                  <RankBadge rank={rank} />
                </div>

                <Avatar entry={entry} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                      {entry.displayName}
                      {isMe && <span className="text-xs ml-1 opacity-70">(you)</span>}
                    </p>
                    <span className={`text-xs font-semibold ${tier.color} shrink-0`}>{tier.label}</span>
                  </div>
                  <p className="text-white/40 text-xs">{city}</p>
                </div>

                <div className="shrink-0 text-xl">
                  {SPORT_OPTIONS.find(s => s.value === entry.sport)?.emoji ?? '🏅'}
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-black text-yellow-400">{formatScore(entry.totalScore)}</p>
                  <p className="text-white/30 text-xs">pts</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAQ accordion */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="sz-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              >
                <span className="text-white font-semibold text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/50 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-white/10">
                  <p className="text-white/60 text-sm leading-relaxed pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Private Leaderboards CTA */}
      <div className="sz-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">Private Leaderboards</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Create a private leaderboard for your team, gym, or friend group. Invite-only with custom scoring rules. Available on Sandlotz Pro.
          </p>
        </div>
        <Link href="/about/products" className="btn-primary text-sm !py-2.5 !px-5 shrink-0 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Upgrade to Pro
        </Link>
      </div>
      </div>
    </div>
  )
}
