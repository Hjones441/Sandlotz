// Generates a Terra widget session token.
// The frontend redirects to https://widget.tryterra.co/session/{token}
// where the user picks their app and authenticates.
// After auth, Terra redirects to NEXT_PUBLIC_APP_URL/api/terra/callback
// and delivers activity data via webhook to /api/terra/webhook.
//
// Required env vars:
//   TERRA_API_KEY
//   TERRA_DEV_ID
//   NEXT_PUBLIC_APP_URL

import { NextRequest, NextResponse } from 'next/server'
import { terraHeaders, TERRA_BASE } from '@/lib/terra'

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const apiKey = process.env.TERRA_API_KEY
  const devId  = process.env.TERRA_DEV_ID

  if (!apiKey || !devId) {
    return NextResponse.json(
      { error: 'Terra not configured. Add TERRA_API_KEY and TERRA_DEV_ID to env vars.' },
      { status: 503 },
    )
  }

  // Optional: pass a reference_id to link this session to a Firebase UID
  const body        = await req.json().catch(() => ({}))
  const referenceId = body.referenceId ?? ''

  const res = await fetch(`${TERRA_BASE}/auth/generateWidgetSession`, {
    method:  'POST',
    headers: terraHeaders(),
    body: JSON.stringify({
      reference_id:  referenceId,
      // Send daily activity data as soon as the user connects
      auth_success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/log-activity?terra=connected`,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[terra/widget-session]', res.status, text)
    return NextResponse.json({ error: 'Terra API error', detail: text }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ sessionToken: data.token, url: data.url })
}
