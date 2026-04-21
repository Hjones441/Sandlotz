import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  increment,
  runTransaction,
  Timestamp,
  limit,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { calculateActivityScore, calculateActivityScoreDetailed, SportType } from './sandlotzScore'
import type { ScoringFitnessData, ScoreBreakdown } from './sandlotzScore'

// ─── Constants ────────────────────────────────────────────────────────────────
const DAILY_POINT_CAP = 500  // per Sandlotz Score™ policy

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid:           string
  displayName:   string
  email:         string
  photoURL:      string | null
  sport:         string
  city:          string
  totalScore:    number   // lifetime, never decreases — used for leaderboard rank
  pointsBalance: number   // spendable balance, decreases on redemption
  createdAt:     Timestamp
}

export interface FitnessData {
  source:          string          // e.g. 'Strava', 'Garmin', 'Apple Health', 'Manual'
  heartRateAvg?:   number
  heartRateMax?:   number
  calories?:       number
  steps?:          number
  pace?:           string          // e.g. '5:30 /km'
  elevationGain?:  number
}

export interface Activity {
  id?:             string
  uid:             string
  sport:           string
  durationMinutes: number
  distanceKm:      number
  intensity:       number
  score:           number
  scoreBreakdown?: ScoreBreakdown
  notes:           string
  imageUrls?:      string[]
  fitnessData?:    FitnessData
  createdAt:       Timestamp
}

export interface LeaderboardEntry {
  uid:         string
  displayName: string
  photoURL:    string | null
  sport:       string
  totalScore:  number
  rank?:       number
}

// ─── Perk / Redemption Types ──────────────────────────────────────────────────

export interface Perk {
  id?:          string
  title:        string
  brand:        string
  category:     string           // 'Gear' | 'Events' | 'Services' | 'Digital' | 'Premium'
  emoji:        string
  description:  string
  cost:         number           // points cost
  totalQty:     number           // total inventory; -1 = unlimited
  remaining:    number           // current available stock
  available:    boolean
  sponsored:    boolean
  flash?:       boolean
  flashEndsAt?: Timestamp
  createdAt:    Timestamp
}

export interface Redemption {
  id?:         string
  uid:         string
  perkId:      string
  perkTitle:   string
  perkEmoji:   string
  cost:        number
  code:        string            // SZ-XXXXXXXX
  redeemedAt:  Timestamp
}

// ─── Challenge Types ──────────────────────────────────────────────────────────

export interface Challenge {
  id?:          string
  title:        string
  description:  string
  sport:        string           // 'all' | SportType
  goal:         number           // e.g. total minutes or km
  goalUnit:     string           // 'minutes' | 'km' | 'activities'
  reward:       number           // bonus PlayerPoints
  emoji:        string
  startDate:    Timestamp
  endDate:      Timestamp
  sponsored:    boolean
  sponsorName?: string
  createdAt:    Timestamp
}

export interface ChallengeParticipant {
  id?:          string
  challengeId:  string
  uid:          string
  displayName:  string
  photoURL:     string | null
  progress:     number           // current progress toward goal
  completed:    boolean
  joinedAt:     Timestamp
}

// ─── Marketplace Types ────────────────────────────────────────────────────────

export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Fair'
export type ListingCategory  = 'Equipment' | 'Apparel' | 'Footwear' | 'Accessories' | 'Other'

export interface MarketplaceListing {
  id?:          string
  uid:          string
  displayName:  string
  photoURL:     string | null
  title:        string
  description:  string
  price:        number
  sport:        string
  category:     ListingCategory
  condition:    ListingCondition
  imageUrls?:   string[]
  contactEmail: string
  sold:         boolean
  createdAt:    Timestamp
}

// ─── User Operations ──────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    uid,
    displayName:   data.displayName   ?? '',
    email:         data.email         ?? '',
    photoURL:      data.photoURL      ?? null,
    sport:         data.sport         ?? 'running',
    city:          data.city          ?? '',
    totalScore:    0,
    pointsBalance: 0,
    createdAt:     serverTimestamp(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data() as Record<string, unknown>
  // Back-fill pointsBalance for accounts created before it existed
  if (data.pointsBalance === undefined) {
    data.pointsBalance = data.totalScore ?? 0
  }
  return data as unknown as UserProfile
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'totalScore' | 'pointsBalance'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>)
}

// ─── Activity Operations ──────────────────────────────────────────────────────

export async function logActivity(params: {
  uid:             string
  sport:           SportType
  durationMinutes: number
  distanceKm:      number
  intensity:       number
  notes:           string
  city:            string
  displayName:     string
  photoURL:        string | null
  imageUrls?:      string[]
  fitnessData?:    FitnessData
}): Promise<number> {
  const { uid, sport, durationMinutes, distanceKm, intensity, notes, city, displayName, photoURL, imageUrls, fitnessData } = params
  const scoringFitness: ScoringFitnessData | undefined = fitnessData
    ? {
        source:        fitnessData.source,
        heartRateAvg:  fitnessData.heartRateAvg,
        elevationGain: fitnessData.elevationGain,
        calories:      fitnessData.calories,
      }
    : undefined
  const breakdown = calculateActivityScoreDetailed(sport, durationMinutes, distanceKm, intensity, scoringFitness)
  const rawScore  = breakdown.total

  // ── Daily 500-point cap (per Sandlotz Score™ policy) ──────────────────────
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayActivities = await getDocs(
    query(
      collection(db, 'activities'),
      where('uid', '==', uid),
      where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    )
  )
  const earnedToday = todayActivities.docs.reduce((sum, d) => sum + ((d.data().score as number) ?? 0), 0)
  const remaining   = Math.max(0, DAILY_POINT_CAP - earnedToday)
  const score       = Math.min(rawScore, remaining)
  // ─────────────────────────────────────────────────────────────────────────

  // Write activity document with full score breakdown for audit trail
  await addDoc(collection(db, 'activities'), {
    uid,
    sport,
    durationMinutes,
    distanceKm,
    intensity,
    score,
    scoreBreakdown: {
      basePoints:     breakdown.basePoints,
      distanceBonus:  breakdown.distanceBonus,
      elevationBonus: breakdown.elevationBonus,
      caloriesBonus:  breakdown.caloriesBonus,
      hrMultiplier:   breakdown.hrMultiplier,
      sourceVerified: breakdown.sourceVerified,
      durationDamped: breakdown.durationDamped,
      rawScore,
      cappedByDaily:  score < rawScore,
    },
    notes,
    ...(imageUrls && imageUrls.length > 0 && { imageUrls }),
    ...(fitnessData && { fitnessData }),
    createdAt: serverTimestamp(),
  })

  // Increment user's cumulative score AND spendable balance
  await updateDoc(doc(db, 'users', uid), {
    totalScore:    increment(score),
    pointsBalance: increment(score),
  })

  // Upsert leaderboard entry for user's city
  await setDoc(
    doc(db, 'leaderboards', city, 'entries', uid),
    {
      uid,
      displayName,
      photoURL,
      sport,
      totalScore: increment(score),
      updatedAt:  serverTimestamp(),
    },
    { merge: true },
  )

  return score
}

export async function getUserActivities(uid: string): Promise<Activity[]> {
  const q = query(
    collection(db, 'activities'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Activity))
}

// ─── Leaderboard Operations ───────────────────────────────────────────────────

export async function getLeaderboard(
  city: string = 'Columbus',
  sportFilter?: string,
): Promise<LeaderboardEntry[]> {
  const entriesRef = collection(db, 'leaderboards', city, 'entries')
  const q          = query(entriesRef, orderBy('totalScore', 'desc'))
  const snap       = await getDocs(q)

  let entries = snap.docs.map(d => d.data() as unknown as LeaderboardEntry)

  if (sportFilter && sportFilter !== 'all') {
    entries = entries.filter(e => e.sport === sportFilter)
  }

  return entries.map((e, i) => ({ ...e, rank: i + 1 }))
}

// ─── Perk Operations ──────────────────────────────────────────────────────────

export async function getPerks(): Promise<Perk[]> {
  const q    = query(collection(db, 'perks'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Perk))
}

/** Atomically redeem a perk — deducts pointsBalance, decrements inventory, creates redemption doc */
export async function redeemPerk(uid: string, perkId: string): Promise<string> {
  const code = 'SZ-' + Math.random().toString(36).substring(2, 10).toUpperCase()

  await runTransaction(db, async (tx) => {
    const perkRef = doc(db, 'perks', perkId)
    const userRef = doc(db, 'users', uid)

    const perkSnap = await tx.get(perkRef)
    const userSnap = await tx.get(userRef)

    if (!perkSnap.exists()) throw new Error('Perk not found.')
    if (!userSnap.exists()) throw new Error('User not found.')

    const perk = perkSnap.data() as Perk
    const user = userSnap.data() as UserProfile

    if (!perk.available)   throw new Error('This perk is no longer available.')
    if (perk.remaining === 0) throw new Error('This perk is sold out.')

    const balance = user.pointsBalance ?? user.totalScore ?? 0
    if (balance < perk.cost) throw new Error(`Not enough points. You need ${perk.cost - balance} more.`)

    // Deduct user balance
    tx.update(userRef, { pointsBalance: increment(-perk.cost) })

    // Decrement perk inventory (set unavailable if last one)
    const newRemaining = perk.totalQty === -1 ? -1 : perk.remaining - 1
    tx.update(perkRef, {
      remaining: newRemaining === -1 ? -1 : newRemaining,
      available: newRemaining === -1 ? true : newRemaining > 0,
    })

    // Write redemption record
    const redemptionRef = doc(collection(db, 'redemptions'))
    tx.set(redemptionRef, {
      uid,
      perkId,
      perkTitle: perk.title,
      perkEmoji: perk.emoji,
      cost:      perk.cost,
      code,
      redeemedAt: serverTimestamp(),
    })
  })

  return code
}

export async function getUserRedemptions(uid: string): Promise<Redemption[]> {
  const q    = query(
    collection(db, 'redemptions'),
    where('uid', '==', uid),
    orderBy('redeemedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Redemption))
}

// ─── Challenge Operations ─────────────────────────────────────────────────────

export async function getChallenges(): Promise<Challenge[]> {
  const q    = query(collection(db, 'challenges'), orderBy('endDate', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Challenge))
}

export async function joinChallenge(
  challengeId: string,
  uid: string,
  displayName: string,
  photoURL: string | null,
): Promise<void> {
  // Check not already joined
  const existing = await getDocs(query(
    collection(db, 'challengeParticipants'),
    where('challengeId', '==', challengeId),
    where('uid', '==', uid),
  ))
  if (!existing.empty) return // already joined

  await addDoc(collection(db, 'challengeParticipants'), {
    challengeId,
    uid,
    displayName,
    photoURL,
    progress:  0,
    completed: false,
    joinedAt:  serverTimestamp(),
  })
}

export async function getChallengeParticipant(
  challengeId: string,
  uid: string,
): Promise<ChallengeParticipant | null> {
  const q    = query(
    collection(db, 'challengeParticipants'),
    where('challengeId', '==', challengeId),
    where('uid', '==', uid),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as unknown as ChallengeParticipant
}

export async function getChallengeLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
  const q    = query(
    collection(db, 'challengeParticipants'),
    where('challengeId', '==', challengeId),
    orderBy('progress', 'desc'),
    limit(50),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as ChallengeParticipant))
}

// ─── Marketplace Operations ───────────────────────────────────────────────────

export async function getMarketplaceListings(sportFilter?: string): Promise<MarketplaceListing[]> {
  const q    = query(
    collection(db, 'marketplace'),
    where('sold', '==', false),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  let listings = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as MarketplaceListing))
  if (sportFilter && sportFilter !== 'all') {
    listings = listings.filter(l => l.sport === sportFilter)
  }
  return listings
}

export async function createMarketplaceListing(
  params: Omit<MarketplaceListing, 'id' | 'sold' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'marketplace'), {
    ...params,
    sold:      false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function markListingSold(listingId: string): Promise<void> {
  await updateDoc(doc(db, 'marketplace', listingId), { sold: true })
}

export async function deleteMarketplaceListing(listingId: string): Promise<void> {
  await deleteDoc(doc(db, 'marketplace', listingId))
}

// ─── Admin Seed Operations ────────────────────────────────────────────────────

export async function seedPerks(): Promise<void> {
  const perks = [
    {
      title: '20% Off Nike Gear',       brand: 'Nike',       category: 'Gear',     emoji: '👟',
      description: 'Discount code for Nike.com. Valid on full-price items. Expires 30 days after redemption.',
      cost: 500,  totalQty: 100, remaining: 100, available: true,  sponsored: true,
    },
    {
      title: 'Free Protein Shake',      brand: 'GNC',        category: 'Services', emoji: '💪',
      description: 'Redeemable at any GNC location. One per account. Present the app on pickup.',
      cost: 200,  totalQty: 200, remaining: 200, available: true,  sponsored: true,
    },
    {
      title: 'Columbus FC Tickets',     brand: 'Columbus FC', category: 'Events',  emoji: '⚽',
      description: '2 tickets to a home match. Seat selection subject to availability.',
      cost: 1000, totalQty: 50,  remaining: 50,  available: true,  sponsored: true,
    },
    {
      title: 'Fitness Assessment',      brand: 'FitLab',     category: 'Services', emoji: '📊',
      description: 'Full performance analysis: VO2 max, body comp, movement screening.',
      cost: 750,  totalQty: 30,  remaining: 30,  available: true,  sponsored: false,
    },
    {
      title: '$25 SportChek Credit',    brand: 'SportChek',  category: 'Digital',  emoji: '🏬',
      description: 'In-store or online credit. No minimum purchase required.',
      cost: 300,  totalQty: -1,  remaining: -1,  available: true,  sponsored: false,
    },
    {
      title: 'Sandlotz Pro — 1 Month',  brand: 'Sandlotz',   category: 'Premium',  emoji: '⭐',
      description: 'Unlock all premium features: advanced analytics, unlimited listing boosts, early challenge access, exclusive badges.',
      cost: 400,  totalQty: -1,  remaining: -1,  available: true,  sponsored: false,
    },
    {
      title: 'Garmin Watch Raffle',     brand: 'Garmin',     category: 'Gear',     emoji: '⌚',
      description: 'Enter to win a Garmin Forerunner 265. Drawing every Friday. Each entry = 1 ticket.',
      cost: 150,  totalQty: -1,  remaining: -1,  available: true,  sponsored: true,  flash: true,
    },
    {
      title: '1-on-1 Coaching Session', brand: 'CoachHub',   category: 'Services', emoji: '🏀',
      description: '60-minute personalized coaching with a certified trainer. Book within 7 days.',
      cost: 600,  totalQty: 20,  remaining: 0,   available: false, sponsored: false,
    },
  ]

  for (const perk of perks) {
    await addDoc(collection(db, 'perks'), { ...perk, createdAt: serverTimestamp() })
  }
}

export async function seedChallenges(): Promise<void> {
  const now   = Timestamp.now()
  const week  = Timestamp.fromMillis(Date.now() + 7  * 24 * 60 * 60 * 1000)
  const month = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const challenges = [
    {
      title:       '30-Day Running Streak',
      description: 'Log at least one running activity every day for 30 days. Build the habit that changes everything.',
      sport:       'running', goal: 30, goalUnit: 'activities',
      reward: 500, emoji: '🏃', startDate: now, endDate: month, sponsored: false,
    },
    {
      title:       'Columbus 100K Challenge',
      description: 'Cover 100 km across any activities in one week. Walking, running, cycling — it all counts.',
      sport:       'all', goal: 100, goalUnit: 'km',
      reward: 300, emoji: '🏙️', startDate: now, endDate: week, sponsored: true, sponsorName: 'Columbus FC',
    },
    {
      title:       'Summer Swim Series',
      description: 'Log 10 swimming sessions before the end of the month. Every lap counts.',
      sport:       'swimming', goal: 10, goalUnit: 'activities',
      reward: 250, emoji: '🏊', startDate: now, endDate: month, sponsored: false,
    },
    {
      title:       '500-Minute Grind',
      description: 'Accumulate 500 minutes of any workout this week. Quality over speed — just show up.',
      sport:       'all', goal: 500, goalUnit: 'minutes',
      reward: 200, emoji: '⏱️', startDate: now, endDate: week, sponsored: true, sponsorName: 'GNC',
    },
  ]

  for (const challenge of challenges) {
    await addDoc(collection(db, 'challenges'), { ...challenge, createdAt: serverTimestamp() })
  }
}
