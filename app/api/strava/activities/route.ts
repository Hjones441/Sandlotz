// Fetch recent Strava activities for the authenticated user
// Called from the log-activity page when Strava is connected
// Returns normalized activity data ready to populate the form

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

interface StravaActivity {
  id:               number
  name:             string
  type:             string
  sport_type:       string
  elapsed_time:     number   // seconds
  distance:         number   // metres
  total_elevation_gain: number // metres
  average_heartrate?: number
  max_heartrate?:     number
  calories?:          number
  average_speed?:     number  // m/s
  start_date:         string
}

interface NormalizedActivity {
  stravaId:        number
  name:            string
  sport:           string
  durationMinutes: number
  distanceKm:      number
  elevationGain:   number
  heartRateAvg?:   number
  heartRateMax?:   number
  calories?:       number
  paceMinPerKm?:   string
  startDate:       string
}

function mapStravaSport(stravaType: string): string {
  const map: Record<string, string> = {
    Run:       'running',
    Ride:      'cycling',
    Swim:      'swimming',
    WeightTraining: 'lifting',
    Workout:   'hiit',
    Basketball:'basketball',
    Soccer:    'soccer',
    Tennis:    'tennis',
    Yoga:      'yoga',
    Hike:      'hiking',
    VirtualRide: 'cycling',
    VirtualRun:  'running',
  }
  return map[stravaType] ?? 'other'
}

function formatPace(speedMs: number | undefined): string | undefined {
  if (!speedMs || speedMs <= 0) return undefined
  const secsPerKm = 1000 / speedMs
  const mins      = Math.floor(secsPerKm / 60)
  const secs      = Math.round(secsPerKm % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

async function refreshStravaToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  const data = await res.json()
  return { accessToken: data.access_token, expiresAt: data.expires_at }
}

export async function GET(req: NextRequest) {
  const cookieRaw = req.cookies.get('strava_tokens')?.value
  if (!cookieRaw) {
    return NextResponse.json({ error: 'not_connected' }, { status: 401 })
  }

  let tokens: { accessToken: string; refreshToken: string; expiresAt: number }
  try {
    tokens = JSON.parse(cookieRaw)
  } catch {
    return NextResponse.json({ error: 'invalid_tokens' }, { status: 401 })
  }

  let { accessToken } = tokens
  const response      = NextResponse.next()

  // Refresh if token expired (with 5-min buffer)
  if (Date.now() / 1000 > tokens.expiresAt - 300) {
    try {
      const refreshed = await refreshStravaToken(tokens.refreshToken)
      accessToken     = refreshed.accessToken
      // Update cookie with new token
      response.cookies.set('strava_tokens', JSON.stringify({ ...tokens, accessToken, expiresAt: refreshed.expiresAt }), {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 60 * 24 * 90,
        path:     '/',
      })
    } catch {
      return NextResponse.json({ error: 'token_refresh_failed' }, { status: 401 })
    }
  }

  // Fetch up to 10 recent activities
  const stravaRes = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=10',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!stravaRes.ok) {
    return NextResponse.json({ error: 'strava_api_error', status: stravaRes.status }, { status: 502 })
  }

  const activities: StravaActivity[] = await stravaRes.json()

  const normalized: NormalizedActivity[] = activities.map(a => ({
    stravaId:        a.id,
    name:            a.name,
    sport:           mapStravaSport(a.sport_type || a.type),
    durationMinutes: Math.round(a.elapsed_time / 60),
    distanceKm:      Math.round((a.distance / 1000) * 10) / 10,
    elevationGain:   Math.round(a.total_elevation_gain),
    heartRateAvg:    a.average_heartrate ? Math.round(a.average_heartrate) : undefined,
    heartRateMax:    a.max_heartrate     ? Math.round(a.max_heartrate)     : undefined,
    calories:        a.calories          ?? undefined,
    paceMinPerKm:    formatPace(a.average_speed),
    startDate:       a.start_date,
  }))

  return NextResponse.json({ activities: normalized })
}
