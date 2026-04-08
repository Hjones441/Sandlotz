// Terra sends activity data here via webhook whenever a user's connected
// wearable syncs a new workout. We verify the signature, then store the
// activity in Firestore and award points automatically.
//
// Required env vars:
//   TERRA_SIGNING_SECRET  (from Terra dashboard)
//   TERRA_API_KEY
//   TERRA_DEV_ID

import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { doc, getDoc, collection, addDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateActivityScoreDetailed } from '@/lib/sandlotzScore'
import { mapTerraActivityType, formatPaceFromMs } from '@/lib/terra'
import type { SportType } from '@/lib/sandlotzScore'

function verifyTerraSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return signature === expected
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const sig      = req.headers.get('terra-signature')
  const secret   = process.env.TERRA_SIGNING_SECRET ?? ''

  if (secret && !verifyTerraSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  // Terra sends different event types; we only care about activity data
  const type = payload.type
  if (type !== 'activity' || !payload.data?.length) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const terraUserId  = payload.user?.user_id
  const referenceId  = payload.user?.reference_id  // our Firebase UID
  const provider     = payload.user?.provider ?? 'Unknown'

  if (!referenceId) {
    // No Firebase UID linked — can't award points
    return NextResponse.json({ ok: true, skipped: 'no_reference_id' })
  }

  // Look up user profile
  const userDoc = await getDoc(doc(db, 'users', referenceId))
  if (!userDoc.exists()) {
    return NextResponse.json({ ok: true, skipped: 'user_not_found' })
  }
  const userProfile = userDoc.data()

  // Process each activity in the payload
  const results: { score: number; name: string }[] = []

  for (const act of payload.data) {
    const metadata   = act.metadata ?? {}
    const heartData  = act.heart_rate_data?.summary ?? {}
    const calories   = act.calories_data?.net_activity_calories ?? act.calories_data?.total_burned_calories
    const distance   = act.distance_data?.summary?.distance_meters
      ? act.distance_data.summary.distance_meters / 1000
      : 0
    const elevation  = act.distance_data?.elevation?.gain ?? 0
    const durationS  = metadata.elapsed_time_seconds ?? 0
    const durationM  = Math.round(durationS / 60)
    const avgHR      = heartData.avg_hr_bpm ? Math.round(heartData.avg_hr_bpm) : undefined
    const maxHR      = heartData.max_hr_bpm  ? Math.round(heartData.max_hr_bpm)  : undefined
    const sportRaw   = metadata.type ?? metadata.activity_type ?? 'workout'
    const sport      = mapTerraActivityType(sportRaw) as SportType
    const name       = metadata.name ?? sportRaw
    const speedMs    = act.distance_data?.summary?.avg_speed

    if (durationM < 1) continue // skip sub-minute entries

    const fitnessData = {
      source:        provider,
      heartRateAvg:  avgHR,
      heartRateMax:  maxHR,
      calories:      calories ? Math.round(calories) : undefined,
      elevationGain: Math.round(elevation),
      pace:          formatPaceFromMs(speedMs),
    }

    const breakdown = calculateActivityScoreDetailed(sport, durationM, distance, 3, {
      source:        provider,
      heartRateAvg:  avgHR,
      elevationGain: Math.round(elevation),
      calories:      calories ? Math.round(calories) : undefined,
    })

    // Save activity to Firestore
    await addDoc(collection(db, 'activities'), {
      uid:             referenceId,
      terraActivityId: act.metadata?.summary_id ?? act.id,
      provider,
      sport,
      durationMinutes: durationM,
      distanceKm:      Math.round(distance * 10) / 10,
      intensity:       3,
      score:           breakdown.total,
      scoreBreakdown:  breakdown,
      notes:           name,
      fitnessData,
      source:          'terra_webhook',
      createdAt:       serverTimestamp(),
    })

    // Increment user total score
    await updateDoc(doc(db, 'users', referenceId), {
      totalScore: increment(breakdown.total),
    })

    // Update leaderboard
    const city = userProfile.city ?? 'Other'
    await setDoc(
      doc(db, 'leaderboards', city, 'entries', referenceId),
      {
        uid:         referenceId,
        displayName: userProfile.displayName,
        photoURL:    userProfile.photoURL ?? null,
        sport,
        totalScore:  increment(breakdown.total),
        updatedAt:   serverTimestamp(),
      },
      { merge: true },
    )

    results.push({ score: breakdown.total, name })
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}
