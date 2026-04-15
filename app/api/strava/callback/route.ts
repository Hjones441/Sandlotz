// Strava OAuth callback handler
// Flow: user clicks "Connect Strava" → redirected to Strava auth page →
//       Strava redirects here with ?code= → exchange for tokens → store in Firestore
//
// Required env vars:
//   STRAVA_CLIENT_ID
//   STRAVA_CLIENT_SECRET
//   NEXT_PUBLIC_APP_URL  (e.g. https://sandlotz.vercel.app)

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL('/log-activity?strava=denied', req.url),
    )
  }

  const clientId     = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/log-activity?strava=misconfigured', req.url),
    )
  }

  try {
    // Exchange authorization code for access + refresh tokens
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        grant_type:    'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      throw new Error(`Strava token exchange failed: ${tokenRes.status}`)
    }

    const tokenData = await tokenRes.json()
    // tokenData contains: access_token, refresh_token, expires_at, athlete {...}

    // Store tokens in a secure httpOnly cookie so the browser can't read them
    // but our API routes can use them to fetch Strava data
    const cookieVal = JSON.stringify({
      accessToken:  tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt:    tokenData.expires_at,
      athleteId:    tokenData.athlete?.id,
    })

    const redirectUrl = new URL('/log-activity?strava=connected', req.url)
    const response    = NextResponse.redirect(redirectUrl)

    response.cookies.set('strava_tokens', cookieVal, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 90, // 90 days
      path:     '/',
    })

    return response
  } catch (err) {
    console.error('[strava/callback]', err)
    return NextResponse.redirect(
      new URL('/log-activity?strava=error', req.url),
    )
  }
}
