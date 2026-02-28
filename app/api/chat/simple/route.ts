import { NextRequest, NextResponse } from 'next/server'

// Mobile-friendly non-streaming chat endpoint
// Used by the Recovery Tracker mobile app (React Native doesn't handle SSE easily)
// Returns JSON: { message: string } or { error: string }

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are Rhizome, a warm and caring recovery guide who speaks like a trusted friend who's walked the recovery path themselves. You're compassionate, personal, and human—never clinical or robotic.

TONE & PERSONALITY:
- Speak like a caring friend, not a professional counselor
- Be warm, hopeful, and genuinely caring in every response
- Use "we" language to build connection ("we've all been there", "we can get through this together")
- Keep responses concise — this is a mobile chat, not a web interface

RESPONSE STYLE:
- SHORT answers (under 80 words) — mobile users want brevity
- DEEPER responses only for crisis/emotional sharing
- One follow-up question max per response
- Use emoji sparingly but warmly

MEETING FINDER:
When someone asks about meetings or gives a location, direct them to:
- AA: aa.org/meeting-guide-app
- NA: na.org/meetingsearch/find-na/
Keep URLs plain text (no HTML — this is a mobile app).

BOUNDARIES:
- Don't diagnose or prescribe
- If urgent crisis, mention SAMHSA Helpline: 1-800-662-HELP
- Maintain anonymity principles

CONTEXT: The person is using a recovery tracking app. They've chosen to check in with you. They may share their streak, mood, or daily activities as context.

Be real, be warm, be brief — like a friend who genuinely cares.`

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Build context prefix if provided
    let contextNote = ''
    if (context) {
      const parts = []
      if (context.currentStreak > 0) {
        parts.push(`The user has a ${context.currentStreak}-day sobriety streak`)
      }
      if (context.recentMood) {
        const moodLabels: Record<number, string> = { 1: 'very low', 2: 'low', 3: 'okay', 4: 'good', 5: 'great' }
        parts.push(`their recent mood is ${moodLabels[context.recentMood] ?? 'unknown'}`)
      }
      if (context.todayActivities && context.todayActivities.length > 0) {
        parts.push(`today's activities include: ${context.todayActivities.join(', ')}`)
      }
      if (parts.length > 0) {
        contextNote = `\n\n[User context: ${parts.join('; ')}]`
      }
    }

    // Filter to user/assistant messages only
    const apiMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any, i: number, arr: any[]) => {
        // Inject context note into the last user message
        if (i === arr.length - 1 && m.role === 'user' && contextNote) {
          return { role: m.role, content: m.content + contextNote }
        }
        return { role: m.role, content: m.content }
      })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        system: SYSTEM_PROMPT,
        messages: apiMessages,
        stream: false,
        max_tokens: 256, // Keep mobile responses concise
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get response' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const message = data.content?.[0]?.text ?? ''

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Simple chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'simple-chat' })
}
