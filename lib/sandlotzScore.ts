// ─── Sandlotz Score™ (PlayerPoints) Algorithm ────────────────────────────────
//
// Base formula:
//   score = (duration × intensityMult × sportMult × hrMult × sourceBonus)
//         + (distanceKm × 2 × sportMult)
//         + elevationBonus
//         + caloriesBonus
//
// Modifiers that increase score:
//   - HR Zone 5 (≥170 bpm): ×1.30
//   - Verified source (non-Manual): ×1.05
//   - Elevation: +1 pt per 100 m gain
//   - Calories: +1 pt per 50 kcal (capped at 1000 kcal for manual entries)
//
// Modifiers that reduce score:
//   - Ultra-duration damping: activities > 240 min → ×0.85
//   - Manual-only penalty: source = 'Manual' → ×1.0 (no bonus)

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

// ─── Modifier functions ───────────────────────────────────────────────────────

// Heart-rate zone multiplier (based on % of typical max HR, ref ~190 bpm)
function hrZoneMultiplier(avgHR: number | undefined): number {
  if (!avgHR) return 1.0
  if (avgHR >= 170) return 1.30  // Zone 5 — max effort
  if (avgHR >= 150) return 1.20  // Zone 4 — hard
  if (avgHR >= 130) return 1.10  // Zone 3 — aerobic
  if (avgHR >= 110) return 1.05  // Zone 2 — easy
  return 1.0                      // Zone 1 — very light
}

// +1 pt per 100 m elevation gain (verified data only)
function elevationBonus(elevationGain: number | undefined): number {
  if (!elevationGain || elevationGain <= 0) return 0
  return Math.floor(elevationGain / 100)
}

// +1 pt per 50 kcal; manual entries capped at 1000 kcal to prevent inflation
function caloriesBonus(calories: number | undefined, isManual: boolean): number {
  if (!calories || calories <= 0) return 0
  const capped = isManual ? Math.min(calories, 1000) : calories
  return Math.floor(capped / 50)
}

// Ultra-long activities (>240 min) get a mild damper — diminishing returns past 4 hrs
function durationDamper(durationMinutes: number): number {
  if (durationMinutes > 240) return 0.85
  return 1.0
}

// ─── Exported interfaces ──────────────────────────────────────────────────────

export interface ScoringFitnessData {
  source?:        string   // 'Manual' | 'Strava' | 'Garmin' | 'Apple Health' | ...
  heartRateAvg?:  number   // bpm
  elevationGain?: number   // metres
  calories?:      number   // kcal
}

export interface ScoreBreakdown {
  basePoints:     number   // duration × intensity × sport × HR × source
  distanceBonus:  number   // distanceKm × 2 × sport
  elevationBonus: number   // +1 per 100 m
  caloriesBonus:  number   // +1 per 50 kcal
  total:          number
  hrMultiplier:   number
  sourceVerified: boolean
  durationDamped: boolean
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function calculateActivityScore(
  sport: SportType,
  durationMinutes: number,
  distanceKm: number,
  intensity: number,
  fitnessData?: ScoringFitnessData,
): number {
  return calculateActivityScoreDetailed(sport, durationMinutes, distanceKm, intensity, fitnessData).total
}

export function calculateActivityScoreDetailed(
  sport: SportType,
  durationMinutes: number,
  distanceKm: number,
  intensity: number,
  fitnessData?: ScoringFitnessData,
): ScoreBreakdown {
  const sportMult      = SPORT_MULTIPLIERS[sport] ?? 1.0
  const intensityMult  = INTENSITY_MULTIPLIERS[intensity] ?? 1.0
  const hrMult         = hrZoneMultiplier(fitnessData?.heartRateAvg)
  const isManual       = !fitnessData?.source || fitnessData.source === 'Manual'
  const sourceBonus    = isManual ? 1.0 : 1.05
  const damper         = durationDamper(durationMinutes)

  const base      = durationMinutes * intensityMult * sportMult * hrMult * sourceBonus * damper
  const distBonus = distanceKm * 2.0 * sportMult
  const elBonus   = elevationBonus(fitnessData?.elevationGain)
  const calBonus  = caloriesBonus(fitnessData?.calories, isManual)

  const total = Math.round(base + distBonus + elBonus + calBonus)

  return {
    basePoints:     Math.round(base),
    distanceBonus:  Math.round(distBonus),
    elevationBonus: elBonus,
    caloriesBonus:  calBonus,
    total,
    hrMultiplier:   hrMult,
    sourceVerified: !isManual,
    durationDamped: damper < 1.0,
  }
}

// ─── Plausibility validator ───────────────────────────────────────────────────

export interface PlausibilityWarning {
  field:    string
  message:  string
  severity: 'warn' | 'error'
}

export function validateFitnessData(
  durationMinutes: number,
  fitnessData: ScoringFitnessData,
): PlausibilityWarning[] {
  const warnings: PlausibilityWarning[] = []
  const { heartRateAvg, calories, elevationGain, source } = fitnessData
  const isManual = !source || source === 'Manual'

  if (heartRateAvg !== undefined) {
    if (heartRateAvg < 40 || heartRateAvg > 220) {
      warnings.push({ field: 'heartRateAvg', message: 'Heart rate out of human range (40–220 bpm).', severity: 'error' })
    } else if (heartRateAvg > 200 && isManual) {
      warnings.push({ field: 'heartRateAvg', message: 'HR above 200 bpm is unusual — consider verifying with a connected app.', severity: 'warn' })
    }
  }

  if (calories !== undefined) {
    // Rough max: elite athlete burns ~1,400 kcal/hr
    const maxReasonableCalories = (durationMinutes / 60) * 1400
    if (calories > maxReasonableCalories) {
      warnings.push({ field: 'calories', message: `${calories} kcal seems high for ${durationMinutes} min. Manual entries capped at 1000 kcal for scoring.`, severity: 'warn' })
    }
  }

  if (elevationGain !== undefined && elevationGain > 5000) {
    warnings.push({ field: 'elevationGain', message: 'Elevation gain over 5,000 m is extraordinary. Verify your data source.', severity: 'warn' })
  }

  return warnings
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatScore(score: number): string {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`
  if (score >= 1_000)     return `${(score / 1_000).toFixed(1)}K`
  return score.toString()
}

export const TIER_THRESHOLDS: { label: string; min: number; color: string; badgeClass: string }[] = [
  { label: 'Legend',  min: 10000, color: 'text-yellow-400', badgeClass: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10' },
  { label: 'Elite',   min: 5000,  color: 'text-purple-300', badgeClass: 'text-purple-300 border-purple-300/40 bg-purple-300/10' },
  { label: 'Pro',     min: 2000,  color: 'text-blue-400',   badgeClass: 'text-blue-400 border-blue-400/40 bg-blue-400/10'       },
  { label: 'Athlete', min: 500,   color: 'text-green-400',  badgeClass: 'text-green-400 border-green-400/40 bg-green-400/10'    },
  { label: 'Rookie',  min: 0,     color: 'text-gray-400',   badgeClass: 'text-gray-400 border-gray-400/40 bg-gray-400/10'       },
]

export function getRankTier(score: number): { label: string; color: string; badgeClass: string; min: number } {
  return TIER_THRESHOLDS.find(t => score >= t.min) ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]
}

/** Returns [progressPct, nextTierLabel, pointsToNext] for the tier progress bar */
export function getTierProgress(score: number): { pct: number; nextLabel: string; pointsToNext: number } {
  const idx = TIER_THRESHOLDS.findIndex(t => score >= t.min)
  const current = TIER_THRESHOLDS[idx]
  const next    = TIER_THRESHOLDS[idx - 1]
  if (!next) return { pct: 100, nextLabel: current.label, pointsToNext: 0 }
  const pct = Math.min(100, Math.round(((score - current.min) / (next.min - current.min)) * 100))
  return { pct, nextLabel: next.label, pointsToNext: next.min - score }
}
