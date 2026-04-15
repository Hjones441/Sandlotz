// ─── Terra API helper ─────────────────────────────────────────────────────────
// Terra is a unified fitness API that connects 50+ wearable platforms under one
// OAuth flow. Supported web-connectable platforms listed below.
// Docs: https://docs.tryterra.co

export interface TerraApp {
  id:       string   // Terra's provider string
  label:    string
  color:    string   // brand color
  icon:     string   // emoji fallback
  webReady: boolean  // false = requires native SDK (iOS/Android)
}

export const TERRA_APPS: TerraApp[] = [
  { id: 'STRAVA',          label: 'Strava',         color: '#FC4C02', icon: '🏃', webReady: true  },
  { id: 'GARMIN',          label: 'Garmin',         color: '#00A6CE', icon: '⌚', webReady: true  },
  { id: 'FITBIT',          label: 'Fitbit',         color: '#00B0B9', icon: '💙', webReady: true  },
  { id: 'POLAR',           label: 'Polar',          color: '#D0021B', icon: '❤️', webReady: true  },
  { id: 'WAHOO',           label: 'Wahoo',          color: '#E8002D', icon: '🚴', webReady: true  },
  { id: 'WHOOP',           label: 'Whoop',          color: '#000000', icon: '⚡', webReady: true  },
  { id: 'OURA',            label: 'Oura',           color: '#4A90D9', icon: '💍', webReady: true  },
  { id: 'SUUNTO',          label: 'Suunto',         color: '#EF3C23', icon: '🧭', webReady: true  },
  { id: 'COROS',           label: 'COROS',          color: '#0066CC', icon: '⌚', webReady: true  },
  { id: 'ZWIFT',           label: 'Zwift',          color: '#F97316', icon: '🎮', webReady: true  },
  { id: 'PELOTON',         label: 'Peloton',        color: '#CC0000', icon: '🚲', webReady: true  },
  { id: 'APPLE',           label: 'Apple Health',   color: '#FF2D55', icon: '🍎', webReady: false },
  { id: 'GOOGLE',          label: 'Health Connect', color: '#4285F4', icon: '🤖', webReady: false },
  { id: 'SAMSUNG',         label: 'Samsung Health', color: '#1428A0', icon: '📱', webReady: false },
]

// ─── Normalised activity shape ────────────────────────────────────────────────

export interface TerraActivity {
  terraId:         string
  provider:        string
  name?:           string
  sport:           string   // mapped to Sandlotz SportType
  durationMinutes: number
  distanceKm:      number
  elevationGain:   number
  heartRateAvg?:   number
  heartRateMax?:   number
  calories?:       number
  paceMinPerKm?:   string
  startDate:       string
}

// ─── Sport mapping ────────────────────────────────────────────────────────────

const SPORT_MAP: Record<string, string> = {
  // Running variants
  running: 'running', run: 'running', trail_running: 'running', treadmill: 'running',
  virtual_run: 'running',
  // Cycling variants
  cycling: 'cycling', ride: 'cycling', virtual_ride: 'cycling', indoor_cycling: 'cycling',
  biking: 'cycling', mountain_biking: 'cycling',
  // Swimming
  swimming: 'swimming', swim: 'swimming', open_water_swimming: 'swimming',
  // Lifting
  weight_training: 'lifting', strength_training: 'lifting', weightlifting: 'lifting',
  // HIIT
  hiit: 'hiit', workout: 'hiit', circuit_training: 'hiit', crossfit: 'hiit',
  interval_training: 'hiit',
  // Team sports
  basketball: 'basketball', soccer: 'soccer', football: 'soccer',
  volleyball: 'volleyball', tennis: 'tennis', racquetball: 'tennis',
  // Yoga / mindfulness
  yoga: 'yoga', pilates: 'yoga', stretching: 'yoga',
  // Hiking
  hiking: 'hiking', hike: 'hiking', trail_hiking: 'hiking',
}

export function mapTerraActivityType(raw: string): string {
  const key = raw?.toLowerCase().replace(/\s+/g, '_') ?? ''
  return SPORT_MAP[key] ?? 'other'
}

// ─── Pace helper ─────────────────────────────────────────────────────────────

export function formatPaceFromMs(speedMs: number | undefined): string | undefined {
  if (!speedMs || speedMs <= 0) return undefined
  const secsPerKm = 1000 / speedMs
  const mins = Math.floor(secsPerKm / 60)
  const secs = Math.round(secsPerKm % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ─── Terra REST base ──────────────────────────────────────────────────────────

export function terraHeaders() {
  return {
    'x-api-key':    process.env.TERRA_API_KEY ?? '',
    'dev-id':       process.env.TERRA_DEV_ID  ?? '',
    'Content-Type': 'application/json',
  }
}

export const TERRA_BASE = 'https://api.tryterra.co/v2'
