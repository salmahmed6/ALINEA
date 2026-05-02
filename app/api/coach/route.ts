import { NextRequest, NextResponse } from 'next/server';
import { UserArchetype, EmotionalScore } from '@/lib/types';

const ARCHETYPE_PROMPTS: Record<UserArchetype, string> = {
  'calm-authority': 'You are a calm, composed advisor. Your tone is steady and authoritative. You speak from years of experience.',
  'radical-honesty': 'You are brutally honest. You don\'t sugarcoat. You tell the truth as you see it, with directness and precision.',
  'deep-respect': 'You are respectful and humble. You honor the user\'s autonomy. You guide rather than dictate.',
  'premium-intelligence': 'You are intellectually sharp and sophisticated. You speak to someone who understands nuance and complexity.',
};

export async function POST(request: NextRequest) {
  try {
    const { emotionalScore, userArchetype, recentTrades } = await request.json();

    if (!emotionalScore || !userArchetype) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if we have API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude AI not configured. Using fallback response.' },
        { status: 200 }
      );
    }

    const prompt = generateCoachPrompt(emotionalScore, userArchetype, recentTrades);
    
    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.content[0]?.text || getFallbackMessage(emotionalScore, userArchetype);

    return NextResponse.json({
      message,
      tone: getTone(emotionalScore.level),
      archetype: userArchetype,
    });
  } catch (error) {
    console.error('[v0] Coach API error:', error);
    
    // Return graceful fallback
    const emotionalScore = await request.json().then(r => r.emotionalScore);
    const userArchetype = await request.json().then(r => r.userArchetype);
    
    return NextResponse.json({
      message: getFallbackMessage(emotionalScore, userArchetype),
      tone: getTone(emotionalScore?.level || 'yellow'),
      archetype: userArchetype || 'calm-authority',
    });
  }
}

function generateCoachPrompt(
  emotionalScore: EmotionalScore,
  userArchetype: UserArchetype,
  recentTrades: any[]
): string {
  const archetypeStyle = ARCHETYPE_PROMPTS[userArchetype];
  const signalsBreakdown = Object.entries(emotionalScore.signals)
    .map(([k, v]) => `${k}: ${v}/100`)
    .join(', ');

  const riskLevel =
    emotionalScore.level === 'clean'
      ? 'This trade looks safe.'
      : emotionalScore.level === 'yellow'
        ? 'This trade has some yellow flags.'
        : emotionalScore.level === 'orange'
          ? 'This trade has significant orange warnings.'
          : 'This trade is in the high-risk zone.';

  return `${archetypeStyle}

You are an emotional trading coach. The user is about to make a trade. Here's the analysis:

Risk Level: ${emotionalScore.level.toUpperCase()} (Score: ${emotionalScore.score}/100)
Signal Breakdown: ${signalsBreakdown}

${riskLevel}

Give the user ONE short, punchy piece of advice (1-2 sentences max). If the score is high (70+), recommend they wait. If it's low (below 40), encourage confidence. Be in character.`;
}

function getTone(level: 'clean' | 'yellow' | 'orange' | 'block'): 'supportive' | 'cautionary' | 'blocking' {
  return level === 'clean' ? 'supportive' : level === 'block' ? 'blocking' : 'cautionary';
}

function getFallbackMessage(emotionalScore: any, userArchetype: UserArchetype): string {
  const responses: Record<UserArchetype, Record<string, string>> = {
    'calm-authority': {
      clean: 'This trade aligns with your pattern. Proceed with confidence.',
      yellow: 'Exercise caution. The signals suggest some risk factors.',
      orange: 'I recommend waiting. Your emotional state is elevated.',
      block: 'Hold. This is not the right moment. Reconsider.',
    },
    'radical-honesty': {
      clean: 'Your metrics are solid. Go for it.',
      yellow: 'Some red flags. Are you sure about this?',
      orange: 'Stop. You\'re being irrational right now.',
      block: 'Blocked. Not happening today.',
    },
    'deep-respect': {
      clean: 'The data supports this decision. Trust yourself.',
      yellow: 'Perhaps take a moment to reflect.',
      orange: 'I suggest reconsidering. What do you think?',
      block: 'I strongly advise against this. May we pause?',
    },
    'premium-intelligence': {
      clean: 'The behavioral signals are optimal. Execute.',
      yellow: 'Several signal deviations noted. Refine your thesis.',
      orange: 'High emotional volatility detected. Recalibrate.',
      block: 'This trade violates your risk parameters. Reject.',
    },
  };

  const level = emotionalScore?.level || 'yellow';
  return responses[userArchetype]?.[level] || 'Take a breath. Is this really the right move?';
}
