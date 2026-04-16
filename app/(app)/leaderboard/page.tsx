'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLeaderboard, LeaderboardEntry } from '@/lib/firestore'
import { SPORT_OPTIONS, formatScore, getRankTier } from '@/lib/sandlotzScore'
import {
  Trophy, Medal, ChevronDown, Users, Zap, MapPin, Filter,
  Share2, TrendingUp, School, CheckCircle, Shield, Info,
} from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import Image from 'next/image'
import Link from 'next/link'

const CITIES = ['Columbus', 'New York', 'Cleveland', 'Cincinnati', 'Chicago', 'Los Angeles', 'Houston', 'Phoenix']
const AGE_GROUPS = ['All', '18–24', '25–34', '35–44', '45–54', '55+']
const GENDERS    = ['All', 'Male', 'Female', 'Non-binary']

const CHALLENGES = [
  { id: '1', sponsor: 'Nike',   title: "Nike's NYC Borough Battle",       days: 3, participants: 1204,  progress: 85 },
  { id: '2', sponsor: 'Garmin', title: "Garmin's Global Running Day",     days: 1, participants: 8753,  progress: 92 },
  { id: '3', sponsor: 'Wilson', title: "Wilson's Weekend Warrior Tennis", days: 2, participants: 450,   progress: 45 },
]

const DISCLAIMER_PARAGRAPHS = [
  'PlayerPoints are non-transferable, promotional loyalty points issued by Sandlotz for participation and engagement within the platform. PlayerPoints hold no cash or monetary value and cannot be redeemed for cash, credit, or gift cards. Sandlotz reserves the right to modify, revoke, devalue, or expire points at any time, with or without notice, and at its sole discretion.',
  'Perks, discounts, or items available in the Perks Store are subject to availability and may change at any time. Sandlotz makes no warranties regarding third-party offers or items redeemed via the Perks Store.',
  'Users are prohibited from attempting to sell, trade, or exchange PlayerPoints for any consideration outside of Sandlotz. Any such attempt is a violation of our Terms of Service and may result in account suspension or termination. All redeemed perks are tied to your Sandlotz account and are strictly non-transferable.',
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl leading-none">🥇</span>
  if (rank === 2) return <span className="text-xl leading-none">🥈</span>
  if (rank === 3) return <span className="text-xl leading-none">🥉</span>
  return <span className="w-8 text-center font-black text-white/40 text-sm">#{rank}</span>
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  if (entry.photoURL) {
    return (
      <Image src={entry.photoURL} alt={entry.displayName} width={40} height={40}
        className="w-10 h-10 rounded-full object-cover shrink-0" />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-purple-800/60 border border-white/10 flex items-center justify-center text-yellow-400 font-black text-sm shrink-0">
      {entry.displayName?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function LeaderboardPage() {
  const { user, profile } = useAuth()
  const [entries,     setEntries]     = useState<LeaderboardEntry[]>([])
  const [loading,     setLoading]     = useState(true)
  const [city,        setCity]        = useState('Columbus')
  const [sportFilter, setSportFilter] = useState('all')
  const [ageFilter,   setAgeFilter]   = useState('All')
  const [genderFilter,setGenderFilter]= useState('All')
  const [zipInput,    setZipInput]    = useState('')
  const [openFaq,     setOpenFaq]     = useState(false)
  const [joinedIds,   setJoinedIds]   = useState<Set<string>>(new Set())
  const [toast,       setToast]       = useState('')
  const [challengeZip,setChallengeZip]= useState('')
  const [challengeSport, setChallengeSport] = useState('All Sports')
  const [challengeStatus, setChallengeStatus] = useState('Active')
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => { return () => { if (toastRef.current) clearTimeout(toastRef.current) } }, [])

  useEffect(() => {
    setLoading(true)
    getLeaderboard(city, sportFilter)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [city, sportFilter])

  const displayEntries = useMemo(() => entries, [entries])
  const myRank = displayEntries.findIndex(e => e.uid === user?.uid) + 1

  const locationLabel = profile?.city ?? city

  return (
    <div className="min-h-screen bg-[#0e0825]">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Leaderboard" subtitle="Ranked by SweatScore™"
          right={<Trophy className="w-5 h-5 text-brand-yellow" />} />
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#7C3AED] to-[#6D28D9] px-4 pt-8 pb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-black text-white">Community Leaderboards</h1>
        </div>
        <p className="text-white/70 text-sm max-w-lg mx-auto">
          See how you stack up on local and global leaderboards. Your SweatScore is your rank.
        </p>
      </section>

      {/* ── Banner image + FAQ ─────────────────────────────────────────────── */}
      <section className="bg-[#6D28D9] px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          {/* Banner placeholder */}
          <div className="relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl overflow-hidden" style={{ aspectRatio: '2/1', maxHeight: '280px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-sm">Community Map Coming Soon</p>
              </div>
            </div>
            <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              {locationLabel}
            </div>
          </div>

          {/* FAQ accordion */}
          <div className="mt-3 bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenFaq(!openFaq)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-white font-semibold text-sm">How do Leaderboards & Points work?</span>
              <ChevronDown className={`w-4 h-4 text-white/50 shrink-0 transition-transform ${openFaq ? 'rotate-180' : ''}`} />
            </button>
            {openFaq && (
              <div className="px-5 pb-5 border-t border-white/10 space-y-3 pt-4">
                {[
                  ['SweatScore™', 'Earned by logging verified activities. Sport multiplier, intensity, heart rate zone, elevation, calories, and verified device source all factor into your score.'],
                  ['Rank Updates', 'Your rank reflects real-time relative standing. Your score never drops — only others catching up can lower your rank.'],
                  ['Verified Bonus', 'Activities synced from Garmin, Apple Health, Strava, or other connected apps earn a 5% verified bonus on top of base score.'],
                  ['City Leaderboards', 'Every athlete is placed on their city leaderboard. Scores accumulate permanently — compete locally or globally.'],
                ].map(([title, body], i) => (
                  <div key={i}>
                    <p className="text-yellow-400 font-bold text-xs mb-0.5">{title}</p>
                    <p className="text-white/60 text-xs leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── My Rank Banner ─────────────────────────────────────────────────── */}
        {user && myRank > 0 && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Medal className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-bold text-sm">Your Rank in {city}</p>
                <p className="text-white/50 text-xs">{formatScore(entries.find(e => e.uid === user.uid)?.totalScore ?? 0)} pts</p>
              </div>
            </div>
            <span className="font-black text-yellow-400 text-2xl">#{myRank}</span>
          </div>
        )}

        {/* ── Sponsored Challenges ──────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-black text-white">Sponsored Challenges</h2>
              </div>
              <p className="text-white/50 text-sm">Join brand-sponsored challenges to compete for glory and bonus PlayerPoints.</p>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              <input
                value={challengeZip}
                onChange={e => setChallengeZip(e.target.value)}
                placeholder="Zip Code..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs w-32 outline-none focus:border-yellow-400/50"
              />
              <select value={challengeSport} onChange={e => setChallengeSport(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-yellow-400/50">
                <option className="bg-[#1E1040]">All Sports</option>
                {SPORT_OPTIONS.map(s => <option key={s.value} className="bg-[#1E1040]">{s.label}</option>)}
              </select>
              <select value={challengeStatus} onChange={e => setChallengeStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-yellow-400/50">
                {['Active', 'Upcoming', 'Ended'].map(s => <option key={s} className="bg-[#1E1040]">{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {CHALLENGES.map(c => {
              const joined = joinedIds.has(c.id)
              return (
                <div key={c.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-white font-bold">{c.title}</p>
                    <span className="text-white/50 text-xs shrink-0">{c.days} {c.days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 mb-3">
                    <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Users className="w-4 h-4" />
                      {c.participants.toLocaleString()} Participants
                    </div>
                    <button
                      onClick={() => {
                        if (!joined) {
                          setJoinedIds(prev => { const s = new Set(prev); s.add(c.id); return s })
                          showToast(`Joined "${c.title}"! Full tracking coming soon.`)
                        }
                      }}
                      disabled={joined}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                        joined
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                          : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300'
                      }`}
                    >
                      {joined ? <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Joined</span> : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Find Your Niche ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-black text-white">Find Your Niche</h2>
          </div>
          <p className="text-white/50 text-sm mb-4">Narrow down the rankings to find your community.</p>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-white/50 text-xs font-semibold block mb-1.5">Zip Code</label>
                <input
                  value={zipInput}
                  onChange={e => setZipInput(e.target.value)}
                  placeholder="e.g. 10011"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold block mb-1.5">Sport</label>
                <select value={sportFilter} onChange={e => setSportFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 appearance-none">
                  <option value="all" className="bg-[#1E1040]">All Sports</option>
                  {SPORT_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#1E1040]">{s.emoji} {s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold block mb-1.5">Age Group</label>
                <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 appearance-none">
                  {AGE_GROUPS.map(a => <option key={a} className="bg-[#1E1040]">{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold block mb-1.5">Gender</label>
                <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 appearance-none">
                  {GENDERS.map(g => <option key={g} className="bg-[#1E1040]">{g}</option>)}
                </select>
              </div>
            </div>

            {/* City quick-select */}
            <div className="flex gap-2 flex-wrap">
              <label className="text-white/40 text-xs self-center">City:</label>
              {CITIES.slice(0, 6).map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    city === c ? 'bg-yellow-400 text-purple-900' : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          {loading ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-12 text-center">
              <div className="w-10 h-10 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mx-auto" />
            </div>
          ) : displayEntries.length === 0 ? (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-lg">No athletes yet in {city}.</p>
              <p className="text-white/30 text-sm mt-2">Be the first — log an activity!</p>
              <Link href="/log-activity" className="inline-block mt-4 bg-yellow-400 text-purple-900 font-bold text-sm px-6 py-2.5 rounded-xl">
                Log Activity
              </Link>
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[64px_1fr_auto] px-5 py-3 border-b border-white/10">
                <span className="text-white/40 text-xs font-semibold">Rank</span>
                <span className="text-white/40 text-xs font-semibold">Player</span>
                <span className="text-white/40 text-xs font-semibold text-right">SweatScore</span>
              </div>

              {displayEntries.map((entry, i) => {
                const tier  = getRankTier(entry.totalScore)
                const isMe  = entry.uid === user?.uid
                const rank  = i + 1
                const isBrandAmbassador = rank <= 5 && entry.totalScore > 0

                return (
                  <div
                    key={entry.uid}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-white/[0.05] last:border-0 transition-colors ${
                      isMe ? 'bg-yellow-400/8' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-10 flex justify-center shrink-0">
                      <RankBadge rank={rank} />
                    </div>

                    <Avatar entry={entry} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                          {entry.displayName}{isMe && <span className="text-xs ml-1 opacity-60"> (you)</span>}
                        </p>
                        <span className={`text-xs font-semibold shrink-0 ${tier.color}`}>{tier.label}</span>
                        {isBrandAmbassador && (
                          <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            ⭐ Brand Ambassador
                          </span>
                        )}
                      </div>
                      <p className="text-white/30 text-xs">{city}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-white text-sm">{formatScore(entry.totalScore)} <span className="text-white/40 font-normal text-xs">pts</span></p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${entry.displayName} is ranked #${rank} on Sandlotz with ${entry.totalScore} pts!`)
                          showToast('Copied to clipboard!')
                        }}
                        className="text-white/20 hover:text-white/60 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Private Leaderboards CTA ──────────────────────────────────────── */}
        <section className="bg-[#7C3AED]/30 border border-[#7C3AED]/40 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#7C3AED]/40 flex items-center justify-center mx-auto mb-4">
            <School className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Private Leaderboards for Teams & Schools</h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-2">
            Want to run a private leaderboard for your school, company, or group of friends? Get in touch to join our beta program.
          </p>
          <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
            Boost motivation, track progress, and foster friendly competition with a dedicated leaderboard for your organization.
          </p>
          <button
            onClick={() => showToast('Beta access request submitted! We\'ll be in touch.')}
            className="bg-yellow-400 text-purple-900 font-black text-sm px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Request Beta Access
          </button>
        </section>

        {/* ── PlayerPoints Terms & Disclaimer ──────────────────────────────── */}
        <section className="bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-white/70" />
            <h3 className="text-white font-black">PlayerPoints Terms & Disclaimer</h3>
          </div>
          <div className="space-y-3">
            {DISCLAIMER_PARAGRAPHS.map((para, i) => (
              <p key={i} className="text-white/60 text-sm leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
