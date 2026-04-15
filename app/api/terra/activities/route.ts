// Fetch recent activities for a Terra-connected user.
// The Firebase UID is passed as ?uid= query param (authenticated via cookie/session).
// Terra identifies the user by the reference_id we sent during widget session creation.
//
// Required env vars: TERRA_API_KEY, TERRA_DEV_ID

import { NextRequest, NextResponse } from 'next/server'
import { terraHeaders, TERRA_BASE, mapTerraActivityType, formatPaceFromMs } from '@/lib/terra'
import type { TerraActivity } from '@/lib/terra'

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

  const apiKey = process.env.TERRA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Terra not configured' }, { status: 503 })
  }

  // Get Terra user_id from reference_id (our Firebase UID)
  // Terra stores the reference_id we passed during widget session
  const userRes = await fetch(
    `${TERRA_BASE}/userInfo?reference_id=${encodeURIComponent(uid)}`,
    { headers: terraHeaders() },
  )

  if (!userRes.ok) {
    return NextResponse.json({ activities: [], connected: false })
  }

  const userData   = await userRes.json()
  const terraUsers = userData.users ?? []
  if (terraUsers.length === 0) {
    return NextResponse.json({ activities: [], connected: false })
  }

  // Fetch activities for all connected providers (last 7 days)
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDate   = new Date().toISOString().split('T')[0]

  const allActivities: TerraActivity[] = []

  await Promise.all(
    terraUsers.map(async (tu: { user_id: string; provider: string }) => {
      const res = await fetch(
        `${TERRA_BASE}/activity?user_id=${tu.user_id}&start_date=${startDate}&end_date=${endDate}&to_webhook=false`,
        { headers: terraHeaders() },
      )
      if (!res.ok) return

      const data = await res.json()
      const acts = data.data ?? []

      for (const act of acts) {
        const metadata  = act.metadata ?? {}
        const heartData = act.heart_rate_data?.summary ?? {}
        const calories  = act.calories_data?.net_activity_calories ?? act.calories_data?.total_burned_calories
        const distM     = act.distance_data?.summary?.distance_meters ?? 0
        const elevation = act.distance_data?.elevation?.gain ?? 0
        const durationS = metadata.elapsed_time_seconds ?? 0
        const durationM = Math.round(durationS / 60)
        if (durationM < 1) return

        allActivities.push({
          terraId:         act.metadata?.summary_id ?? String(act.id ?? Math.random()),
          provider:        tu.provider,
          name:            metadata.name ?? metadata.type ?? 'Workout',
          sport:           mapTerraActivityType(metadata.type ?? metadata.activity_type ?? ''),
          durationMinutes: durationM,
          distanceKm:      Math.round((distM / 1000) * 10) / 10,
          elevationGain:   Math.round(elevation),
          heartRateAvg:    heartData.avg_hr_bpm ? Math.round(heartData.avg_hr_bpm) : undefined,
          heartRateMax:    heartData.max_hr_bpm  ? Math.round(heartData.max_hr_bpm)  : undefined,
          calories:        calories ? Math.round(calories) : undefined,
          paceMinPerKm:    formatPaceFromMs(act.distance_data?.summary?.avg_speed),
          startDate:       metadata.start_time ?? new Date().toISOString(),
        })
      }
    }),
  )

  // Sort newest first
  allActivities.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return NextResponse.json({
    connected: true,
    providers: Array.from(new Set(terraUsers.map((u: any) => u.provider as string))),
    activities: allActivities.slice(0, 15),
  })
}
