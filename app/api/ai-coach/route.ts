import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = "force-dynamic"

// POST /api/ai-coach
// Body: { activities: Activity[], totalScore: number, tier: string }
// Returns: { insight: string, tips: string[] }

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const body = await req.json()
  const { activities = [], totalScore = 0, tier = 'Rookie', question } = body

  // Summarize recent activity for the prompt (keep token count low)
  const summary = activities.slice(0, 10).map((a: {
    sport: string; durationMinutes: number; distanceKm: number;
    intensity: number; score: number; fitnessData?: { heartRateAvg?: number; source?: string }
  }) =>
    `${a.sport} ${a.durationMinutes}min ${a.distanceKm > 0 ? `${a.distanceKm}km ` : ''}intensity=${a.intensity} score=${a.score}${a.fitnessData?.heartRateAvg ? ` hr=${a.fitnessData.heartRateAvg}bpm` : ''}${a.fitnessData?.source ? ` via ${a.fitnessData.source}` : ''}`
  ).join('\n') || 'No activities yet.'

  const systemContext = `You are an elite AI sports coach for Sandlotz — a fitness marketplace where athletes earn PlayerPoints (Sandlotz Score™) for their workouts and redeem them for real brand rewards.

Athlete profile:
- Tier: ${tier}
- Total Sandlotz Score: ${totalScore} pts
- Recent activities:
${summary}

Sandlotz Score formula: (duration × intensity × sport multiplier × HR zone × source bonus) + distance bonus + elevation bonus + calories bonus. Verified app sources get +5%. Sport multipliers: Swimming ×1.5, HIIT ×1.3, Running ×1.2, Basketball ×1.1, Lifting ×1.0, Cycling ×0.8.`

  // CHAT MODE — handle a specific question
  if (question) {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemContext,
      messages: [{ role: 'user', content: question }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : 'Keep pushing! 💪'
    return NextResponse.json({ insight: text.trim() })
  }

  // INSIGHT MODE — proactive analysis
  if (!activities.length) {
    return NextResponse.json({
      insight: "Log your first activity to unlock AI coaching! 🚀",
      tips: [
        "Start with a 20-minute run or workout to earn your first PlayerPoints.",
        "Connect Strava or Garmin to get an automatic 5% score bonus.",
        "Choose a sport you love — consistency beats intensity every time.",
      ]
    })
  }

  const prompt = `${systemContext}

Respond with a JSON object with exactly two fields:
1. "insight" — one punchy sentence (max 20 words) about this athlete's recent pattern or achievement. Be specific and encouraging.
2. "tips" — array of exactly 3 short, actionable tips (max 15 words each) to increase their Sandlotz Score

Be specific. Reference their actual sports, numbers, and tier. No generic platitudes.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ insight: "Keep grinding — your score is building!", tips: [] })
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      insight: parsed.insight ?? '',
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [],
    })
  } catch {
    return NextResponse.json({ insight: "Keep pushing — consistency is your superpower!", tips: [] })
  }
}
