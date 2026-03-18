// ─── Sandlotz Score™ (PlayerPoints) Algorithm ────────────────────────────────
// Score = (duration × intensityMult × sportMult) + (distanceKm × 2 × sportMult)
// Cumulative score = sum of all activity scores on the user's profile.

export type SportType =
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'lifting'
  | 'hiit'
  | 'basketball'
  | 'soccer'
  | 'volleyball'
  | 'tennis'
  | 'yoga'
  | 'hiking'
  | 'other'

export const SPORT_MULTIPLIERS: Record<SportType, number> = {
  running:    1.2,
  cycling:    0.8,
  swimming:   1.5,
  lifting:    1.0,
  hiit:       1.3,
  basketball: 1.1,
  soccer:     1.1,
  volleyball: 1.0,
  tennis:     1.1,
  yoga:       0.7,
  hiking:     0.9,
  other:      1.0,
}

export const INTENSITY_MULTIPLIERS: Record<number, number> = {
  1: 0.5,   // Easy
  2: 0.75,  // Light
  3: 1.0,   // Moderate
  4: 1.25,  // Hard
  5: 1.5,   // Max Effort
}

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Light',
  3: 'Moderate',
  4: 'Hard',
  5: 'Max Effort',
}

export const SPORT_OPTIONS: { value: SportType; label: string; emoji: string }[] = [
  { value: 'running',    label: 'Running',       emoji: '🏃' },
  { value: 'cycling',    label: 'Cycling',        emoji: '🚴' },
  { value: 'swimming',   label: 'Swimming',       emoji: '🏊' },
  { value: 'lifting',    label: 'Weight Lifting', emoji: '🏋️' },
  { value: 'hiit',       label: 'HIIT',           emoji: '⚡' },
  { value: 'basketball', label: 'Basketball',     emoji: '🏀' },
  { value: 'soccer',     label: 'Soccer',         emoji: '⚽' },
  { value: 'volleyball', label: 'Volleyball',     emoji: '🏐' },
  { value: 'tennis',     label: 'Tennis',         emoji: '🎾' },
  { value: 'yoga',       label: 'Yoga',           emoji: '🧘' },
  { value: 'hiking',     label: 'Hiking',         emoji: '🥾' },
  { value: 'other',      label: 'Other',          emoji: '🏅' },
]

// Heart-rate zone multipliers applied when verified HR data is present.
// Zones based on % of typical max HR (220 - age ≈ 190 used as reference).
// If HR data comes from a connected app (not 'Manual'), a verification bonus is applied.
function hrZoneMultiplier(avgHR: number | undefined): number {
  if (!avgHR) return 1.0
  if (avgHR >= 170) return 1.30  // Zone 5 — max effort
  if (avgHR >= 150) return 1.20  // Zone 4 — hard
  if (avgHR >= 130) return 1.10  // Zone 3 — aerobic
  if (avgHR >= 110) return 1.05  // Zone 2 — easy
  return 1.0                      // Zone 1 — very light
}

// Elevation bonus: +1 pt per 100 m of verified gain
function elevationBonus(elevationGain: number | undefined): number {
  if (!elevationGain) return 0
  return Math.floor(elevationGain / 100)
}

export interface ScoringFitnessData {
  source?:       string
  heartRateAvg?: number
  elevationGain?: number
}

export function calculateActivityScore(
  sport: SportType,
  durationMinutes: number,
  distanceKm: number,
  intensity: number,
  fitnessData?: ScoringFitnessData,
): number {
  const sportMult      = SPORT_MULTIPLIERS[sport] ?? 1.0
  const intensityMult  = INTENSITY_MULTIPLIERS[intensity] ?? 1.0
  const hrMult         = hrZoneMultiplier(fitnessData?.heartRateAvg)
  // Verified source (non-manual) adds a 5% trust bonus
  const verifiedBonus  = fitnessData?.source && fitnessData.source !== 'Manual' ? 1.05 : 1.0

  const basePoints     = durationMinutes * intensityMult * sportMult * hrMult * verifiedBonus
  const distanceBonus  = distanceKm * 2.0 * sportMult
  const elBonus        = elevationBonus(fitnessData?.elevationGain)

  return Math.round(basePoints + distanceBonus + elBonus)
}

export function formatScore(score: number): string {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`
  if (score >= 1_000)     return `${(score / 1_000).toFixed(1)}K`
  return score.toString()
}

export function getRankTier(score: number): { label: string; color: string } {
  if (score >= 10000) return { label: 'Legend',   color: 'text-yellow-400' }
  if (score >= 5000)  return { label: 'Elite',    color: 'text-purple-300' }
  if (score >= 2000)  return { label: 'Pro',      color: 'text-blue-400'   }
  if (score >= 500)   return { label: 'Athlete',  color: 'text-green-400'  }
  return               { label: 'Rookie',   color: 'text-gray-400'   }
}
