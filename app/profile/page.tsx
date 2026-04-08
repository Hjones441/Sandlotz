'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getRankTier, getTierProgress, SPORT_OPTIONS, formatScore } from '@/lib/sandlotzScore'
import NextLink from 'next/link'
import {
  Activity,
  Trophy,
  Star,
  Zap,
  Medal,
  Flame,
  TrendingUp,
  ShoppingCart,
  Gift,
  Target,
  Share2,
  Settings,
  LogOut,
  ExternalLink,
  Wind,
  HeartPulse,
  MapPin,
  Users,
} from 'lucide-react'

// ─── Quest tab state ────────────────────────────────────────────────────────

type QuestTab = 'Daily' | 'Weekly' | 'Monthly'

const QUESTS: Record<QuestTab, { title: string; desc: string; pp: number; inProgress?: boolean; progress?: [number, number] }[]> = {
  Daily: [
    { title: 'Morning Hustle', desc: 'Log any activity before 10 AM', pp: 25 },
    { title: 'Calorie Burn', desc: 'Burn at least 500 calories today', pp: 50, inProgress: true, progress: [320, 500] },
  ],
  Weekly: [
    { title: 'Weekend Warrior', desc: 'Log 3 activities this week', pp: 75 },
    { title: 'Distance Chaser', desc: 'Run or cycle 20 km this week', pp: 100, inProgress: true, progress: [12, 20] },
  ],
  Monthly: [
    { title: 'Consistency King', desc: 'Log an activity 15 days this month', pp: 200 },
    { title: 'Sport Sampler', desc: 'Try 3 different sports this month', pp: 150, inProgress: true, progress: [1, 3] },
  ],
}

// ─── Bar chart heights ───────────────────────────────────────────────────────

const BAR_HEIGHTS = [60, 80, 100, 100, 70, 90, 75]
const BAR_DAYS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa']

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, profile, loading, logOut } = useAuth()
  const router = useRouter()
  const [questTab,  setQuestTab]  = useState<QuestTab>('Daily')
  const [shareMsg,  setShareMsg]  = useState('')

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'My Sandlotz Profile', url })
    } else {
      navigator.clipboard.writeText(url)
      setShareMsg('Link copied!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
      </div>
    )
  }

  const tier = getRankTier(profile.totalScore)
  const initials = profile.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const { pct: progress, nextLabel: nextTier, pointsToNext } = getTierProgress(profile.totalScore)

  const sportLabel = SPORT_OPTIONS.find(s => s.value === profile.sport)?.label ?? 'Other'
  const sportEmoji = SPORT_OPTIONS.find(s => s.value === profile.sport)?.emoji ?? '🏅'

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT COLUMN (60%) ────────────────────────────────────────── */}
        <div className="lg:w-[60%] space-y-4">

          {/* Header / Profile card */}
          <div className="sz-card p-6 relative">
            {/* Top-right icons */}
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={handleShare} title={shareMsg || 'Share profile'} className="text-white/50 hover:text-white transition-colors relative">
                <Share2 className="w-5 h-5" />
                {shareMsg && <span className="absolute -bottom-6 -right-2 text-xs text-green-400 whitespace-nowrap">{shareMsg}</span>}
              </button>
              <NextLink href="/settings" title="Settings" className="text-white/50 hover:text-white transition-colors"><Settings className="w-5 h-5" /></NextLink>
              <button onClick={() => logOut()} title="Sign out" className="text-white/50 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button>
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-black text-2xl">{initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-white">{profile.displayName}</h1>
                  <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full">
                    ALL-STAR TIER
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{profile.city || 'Unknown City'}</span>
                </div>
              </div>
            </div>

            {/* Stat boxes */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-black text-white">{formatScore(profile.totalScore)}</p>
                <p className="text-white/50 text-xs mt-0.5">SweatScore</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Target className="w-5 h-5 text-white/60 mx-auto mb-1" />
                <p className="text-2xl font-black text-white">{profile.totalScore.toLocaleString()}</p>
                <p className="text-white/50 text-xs mt-0.5">PlayerPoints</p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-white/70 text-sm mb-4">
              {(profile as any).bio || 'Passionate athlete always looking for the next challenge. Love competing and connecting with fellow sports enthusiasts.'}
            </p>

            {/* My Sports */}
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">My Sports</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">{sportEmoji} {sportLabel}</span>
                <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">🏀 Basketball</span>
                <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">🚴 Cycling</span>
              </div>
            </div>
          </div>

          {/* PlayerPath Progress */}
          <div className="sz-card p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white/70" />
                <span className="font-bold text-white">PlayerPath Progress</span>
              </div>
              <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{tier.label}</span>
            </div>
            <p className="text-white/50 text-sm mb-4">Track your journey to the top tier.</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Current Level: <span className="text-white font-bold">{tier.label}</span></span>
              <span className="text-white/70">Next Level: <span className="text-white font-bold">{nextTier}</span></span>
            </div>
            <div className="h-2 rounded-full bg-white/10 mb-3">
              <div className="h-2 rounded-full bg-yellow-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white/40 text-xs">{pointsToNext > 0 ? `${pointsToNext.toLocaleString()} pts to ${nextTier}` : 'Max tier reached!'} · Keep logging to level up.</p>
          </div>

          {/* Your Quests */}
          <div className="sz-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-white/70" />
              <span className="font-bold text-white">Your Quests</span>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 w-fit">
              {(['Daily', 'Weekly', 'Monthly'] as QuestTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setQuestTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    questTab === tab ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Quest items */}
            <div className="space-y-3">
              {QUESTS[questTab].map((q, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-white text-sm">{q.title}</p>
                      <p className="text-white/50 text-xs">{q.desc}</p>
                    </div>
                    <span className="text-yellow-400 font-bold text-sm whitespace-nowrap">+{q.pp} PP</span>
                  </div>
                  {q.inProgress && q.progress ? (
                    <>
                      <div className="h-1.5 rounded-full bg-white/10 mb-2">
                        <div
                          className="h-1.5 rounded-full bg-yellow-400/60"
                          style={{ width: `${Math.round((q.progress[0] / q.progress[1]) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">{q.progress[0]}/{q.progress[1]}</span>
                        <button disabled className="text-xs bg-white/10 text-white/40 px-3 py-1 rounded-lg cursor-not-allowed font-semibold">In Progress</button>
                      </div>
                    </>
                  ) : (
                    <button disabled title="Quest tracking coming soon" className="btn-primary !py-1.5 !px-4 text-xs w-full mt-1 opacity-50 cursor-not-allowed">Start Quest</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI-Powered Digest */}
          <div className="sz-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <span className="font-bold text-white">Your AI-Powered Digest</span>
            </div>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">
              Personalized suggestions to help you play, train, and connect. This is for informational purposes only, not medical advice. Consult a physician before changing your fitness routine.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/40 text-sm">No suggestions available. Complete your profile to get personalized tips!</p>
            </div>
          </div>

          {/* Featured Items For You */}
          <div className="sz-card p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-white/70" />
                <span className="font-bold text-white">Featured Items For You</span>
              </div>
              <NextLink href="/marketplace" className="btn-ghost !py-1.5 !px-3 text-xs">View Marketplace</NextLink>
            </div>
            <p className="text-white/40 text-sm mb-4">Promoted and popular items related to your interests.</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Player card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative">
                <div className="flex gap-2 mb-3">
                  <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">Promoted</span>
                  <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-full">Player</span>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-white/50" />
                </div>
                <p className="text-white font-bold text-sm text-center">Marcus J.</p>
                <p className="text-white/40 text-xs text-center mb-2">New York, NY</p>
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">🏀 Basketball</span>
                </div>
                <button disabled title="Player connections coming soon" className="btn-primary w-full !py-1.5 text-xs opacity-50 cursor-not-allowed">Connect</button>
              </div>

              {/* Gear card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex gap-2 mb-3">
                  <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-full">Gear</span>
                </div>
                <div className="bg-white/10 rounded-xl aspect-video flex items-center justify-center mb-3">
                  <ShoppingCart className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white font-bold text-sm">Wilson Evolution Basketball</p>
                <p className="text-white/40 text-xs mb-2">Official size indoor game ball.</p>
                <p className="text-white/40 text-xs mb-2">New York, NY</p>
                <p className="text-yellow-400 font-black mb-2">$45</p>
                <NextLink href="/marketplace" className="btn-primary w-full !py-1.5 text-xs text-center block">View Item</NextLink>
              </div>
            </div>
          </div>

          {/* Featured Perks For You */}
          <div className="sz-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-white/70" />
                <span className="font-bold text-white">Featured Perks For You</span>
              </div>
              <NextLink href="/perks" className="btn-ghost !py-1.5 !px-3 text-xs">View All Perks</NextLink>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { sponsor: 'Sponsored by Garmin', title: 'Garmin Watch Raffle', desc: 'Enter to win a Garmin Forerunner 265.' },
                { sponsor: 'Sponsored by Nike', title: '$10 Nike Gift Card', desc: 'A digital gift card for Nike.com.' },
              ].map((perk, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-white/10 aspect-video flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white/20" />
                  </div>
                  <div className="p-3">
                    <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">{perk.sponsor}</span>
                    <p className="text-white font-bold text-sm mt-2">{perk.title}</p>
                    <p className="text-white/40 text-xs mt-1">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (40%) ───────────────────────────────────────── */}
        <div className="lg:w-[40%] space-y-4">

          {/* Health & Performance */}
          <div className="sz-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-white/70" />
              <span className="font-bold text-white">Health & Performance</span>
            </div>
            <p className="text-white/40 text-sm mb-4">Data from your connected devices.</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <HeartPulse className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-3xl font-black text-white">58</p>
                <p className="text-white/40 text-xs mt-1 leading-tight">Resting Heart Rate (bpm)</p>
                <span className="inline-block mt-2 bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">Above Average</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Wind className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-3xl font-black text-white">45</p>
                <p className="text-white/40 text-xs mt-1 leading-tight">VO2 Max (ml/kg/min)</p>
                <span className="inline-block mt-2 bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">Above Average</span>
              </div>
            </div>

            {/* Weekly Activity bar chart */}
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Weekly Activity</p>
            <div className="flex items-end gap-1.5 h-20 mb-1">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-yellow-400"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mb-5">
              {BAR_DAYS.map((d, i) => (
                <div key={i} className="flex-1 text-center text-white/30 text-xs">{d}</div>
              ))}
            </div>

            <button disabled title="Device sync coming soon" className="btn-ghost w-full flex items-center justify-center gap-2 text-sm opacity-50 cursor-not-allowed">
              <ExternalLink className="w-4 h-4" />
              Link Device
            </button>
          </div>

          {/* My Rankings & Records */}
          <div className="sz-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-white">My Rankings & Records</span>
            </div>
            <p className="text-white/40 text-sm mb-4">Your personal bests and leaderboard standings.</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <Medal className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Top Sport: Basketball</p>
                  <p className="text-white/60 text-xs">Rank #12 in {profile.city || 'New York, NY'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Most Calories Burned</p>
                  <p className="text-white/60 text-xs">700 kcal (Cycling)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Longest Activity Streak</p>
                  <p className="text-white/60 text-xs">7 days</p>
                </div>
              </div>
            </div>

            <NextLink href="/leaderboard" className="btn-ghost w-full text-sm text-center block">View Leaderboards</NextLink>
          </div>

          {/* My Badges & Achievements */}
          <div className="sz-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-white">My Badges & Achievements</span>
            </div>
            <p className="text-white/40 text-sm mb-4 leading-relaxed">
              Digital awards earned from your activities and milestones. Verify them with our AI to add a stamp of authenticity.
            </p>

            <div className="space-y-3">
              {/* Badge 1 */}
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">7-Day Streak</p>
                  <p className="text-white/50 text-xs">Logged an activity every day for a week.</p>
                </div>
                <span className="shrink-0 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">✓ Verified</span>
              </div>

              {/* Badge 2 */}
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <Medal className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">Marathon Finisher</p>
                  <p className="text-white/50 text-xs">Completed a full marathon.</p>
                </div>
                <button disabled title="Badge verification coming soon" className="shrink-0 btn-ghost !py-0.5 !px-2 text-xs opacity-50 cursor-not-allowed">Verify</button>
              </div>

              {/* Badge 3 */}
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <Trophy className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">Top Performer</p>
                  <p className="text-white/50 text-xs">Ranked #1 on a local leaderboard.</p>
                </div>
                <span className="shrink-0 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">✓ Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
