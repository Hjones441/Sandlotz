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
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { calculateActivityScore, SportType } from './sandlotzScore'
import type { ScoringFitnessData, ScoreBreakdown } from './sandlotzScore'
import { calculateActivityScoreDetailed } from './sandlotzScore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid:         string
  displayName: string
  email:       string
  photoURL:    string | null
  sport:       string
  city:        string
  totalScore:  number
  createdAt:   Timestamp
}

export interface FitnessData {
  source:       string          // e.g. 'Strava', 'Garmin', 'Apple Health', 'Manual'
  heartRateAvg?: number
  heartRateMax?: number
  calories?:    number
  steps?:       number
  pace?:        string          // e.g. '5:30 /km'
  elevationGain?: number
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

// ─── User Operations ──────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    uid,
    displayName: data.displayName ?? '',
    email:       data.email ?? '',
    photoURL:    data.photoURL ?? null,
    sport:       data.sport ?? 'other',
    city:        data.city ?? 'Columbus',
    totalScore:  0,
    createdAt:   serverTimestamp(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'totalScore'>>,
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
  const score     = breakdown.total

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
    },
    notes,
    ...(imageUrls && imageUrls.length > 0 && { imageUrls }),
    ...(fitnessData && { fitnessData }),
    createdAt: serverTimestamp(),
  })

  // Increment user's cumulative score
  await updateDoc(doc(db, 'users', uid), { totalScore: increment(score) })

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
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))
}

// ─── Leaderboard Operations ───────────────────────────────────────────────────

export async function getLeaderboard(
  city: string = 'Columbus',
  sportFilter?: string,
): Promise<LeaderboardEntry[]> {
  const entriesRef = collection(db, 'leaderboards', city, 'entries')
  const q          = query(entriesRef, orderBy('totalScore', 'desc'))
  const snap       = await getDocs(q)

  let entries = snap.docs.map(d => d.data() as LeaderboardEntry)

  if (sportFilter && sportFilter !== 'all') {
    entries = entries.filter(e => e.sport === sportFilter)
  }

  return entries.map((e, i) => ({ ...e, rank: i + 1 }))
}
