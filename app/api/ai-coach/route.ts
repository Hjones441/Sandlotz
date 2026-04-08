import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// POST /api/ai-coach
// Body: { activities: Activity[], totalScore: number, tier: string }
// Returns: { insight: string, tips: string[] }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const body = await req.json()
  const { activities = [], totalScore = 0, tier = 'Rookie' } = body

  if (!activities.length) {
    return NextResponse.json({
      insight: "Log your first activity to unlock AI coaching!",
      tips: [
        "Start with a 20-minute run or workout to earn your first PlayerPoints.",
        "Connect a fitness app like Strava or Garmin to get a 5% score bonus.",
        "Choose a sport you genuinely enjoy — consistency beats intensity every time.",
      ]
    })
  }

  // Summarize recent activity for the prompt (keep token count low)
  const summary = activities.slice(0, 10).map((a: {
    sport: string; durationMinutes: number; distanceKm: number;
    intensity: number; score: number; fitnessData?: { heartRateAvg?: number; source?: string }
  }) =>
    `${a.sport} ${a.durationMinutes}min ${a.distanceKm > 0 ? `${a.distanceKm}km ` : ''}intensity=${a.intensity} score=${a.score}${a.fitnessData?.heartRateAvg ? ` hr=${a.fitnessData.heartRateAvg}bpm` : ''}${a.fitnessData?.source ? ` via ${a.fitnessData.source}` : ''}`
  ).join('\n')

  const prompt = `You are an AI sports coach for Sandlotz, a fitness marketplace where athletes earn PlayerPoints (Sandlotz Score™) for workouts.

Athlete profile:
- Tier: ${tier}
- Total Sandlotz Score: ${totalScore} pts
- Recent activities (newest first):
${summary}

Scoring formula reminder: score = (duration × intensity × sport multiplier × HR zone × source bonus) + distance bonus + elevation bonus + calories bonus. Verified app sources get +5%.

Respond with a JSON object with exactly two fields:
1. "insight" — one punchy sentence (max 20 words) about this athlete's recent pattern or achievement
2. "tips" — array of exactly 3 short, actionable tips (max 15 words each) to increase their Sandlotz Score

Keep everything positive, specific, and data-driven. No generic advice. Reference their actual sports and numbers.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Bad AI response' }, { status: 500 })
  }

  const parsed = JSON.parse(jsonMatch[0])
  return NextResponse.json({
    insight: parsed.insight ?? '',
    tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [],
  })
}
