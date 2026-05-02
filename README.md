# ALINEA — Emotional Trading Guard

**"Align your mind. Align your money."**

ALINEA is an AI-powered cognitive coaching platform that intercepts high-risk emotional trades before they happen. Using real-time behavioral signal analysis and personalized Claude AI coaching, ALINEA helps traders make better decisions by understanding the psychology behind their trades.

## Overview

ALINEA analyzes **6 behavioral signals** in real-time:
1. **Decision Speed** — How fast you're acting (fast = risky)
2. **Time of Day** — Market psychology varies by hour
3. **Strategy Deviation** — How much this trade differs from your usual pattern
4. **Trade History** — Consistency with your past decisions
5. **Trade Frequency** — Are you overtrading or undertrading?
6. **Market Mood** — Trading with or against market sentiment?

These signals compute an **Emotional Score (0-100)** that maps to 4 intervention levels:
- **Clean** (0-30): Safe. Proceed with confidence.
- **Yellow** (30-55): Caution. Some risk factors detected.
- **Orange** (55-80): Warning. Significant emotional signals.
- **Block** (80-100): High risk. Blocked from confirming.

## Design System: ALINEA

**Dark Luxury** aesthetic inspired by Bloomberg terminals and high-end watchmaking:
- **Primary Colors:** Deep blacks (#0a0a0a–#1a1a1a) with purple accents (#9d4edd, #c77dff)
- **Triangle Logo:** Represents the peak of aligned decision-making
- **Fonts:** Geist (sans-serif) for precision and clarity
- **Philosophy:** Premium, serious, no noise

## Features

### 1. Landing Page (`/`)
- Hero section with ALINEA branding
- Problem statement: "75% of traders lose to emotion"
- Wallet connection CTA

### 2. Onboarding (`/onboarding`)
- 4 personality archetypes to choose from:
  - **Calm Authority** — Steady, composed coach
  - **Radical Honesty** — Direct, no-nonsense feedback
  - **Deep Respect** — Humble, intuitive guidance
  - **Premium Intelligence** — Sharp, sophisticated advice
- Profile creation & archetype assignment

### 3. Dashboard (`/dashboard`)
- Real-time statistics:
  - Total trades completed/blocked
  - Success rate
  - Average emotional score (last 30 days)
  - Current risk level
- 4-week trend charts (Recharts)
- "Try It Out" CTA to test transactions

### 4. Transaction Interceptor (`/test-transaction`)
- Simulate a transaction (mock wallet)
- See real-time emotional score breakdown
- Get Claude AI coach message personalized to your archetype
- Confirm or cancel transaction
- Data persists to dashboard trends

### 5. Coach API (`/api/coach`)
- Accepts emotional score, archetype, recent trades
- Calls Claude API (if configured)
- Returns personalized coach message + tone
- Fallback responses for MVP

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                    # Root layout with ALINEA branding
│   ├── globals.css                   # Design tokens (dark luxury palette)
│   ├── page.tsx                      # Landing page
│   ├── onboarding/page.tsx           # Personality archetype selection
│   ├── dashboard/page.tsx            # Main dashboard with stats & charts
│   ├── test-transaction/page.tsx     # Transaction simulation
│   └── api/coach/route.ts            # Claude AI coach endpoint
├── components/
│   ├── alinea-logo.tsx               # Triangle logo SVG
│   └── transaction-interceptor.tsx   # Modal for transaction review
├── hooks/
│   └── use-wallet.ts                 # Zustand wallet state + mock connection
├── lib/
│   ├── types.ts                      # TypeScript interfaces
│   ├── signals.ts                    # 6 behavioral signal analyzers + scoring
│   └── storage.ts                    # localStorage utilities for profiles & trades
└── public/                           # Static assets
```

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Environment Variables (Optional)
For Claude AI coaching, add to `.env.local`:
```
ANTHROPIC_API_KEY=sk-...
```

Without this, ALINEA uses fallback coach messages.

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Flow

1. **Land on ALINEA** → Click "Connect Wallet to Begin"
2. **Mock wallet connects** → Redirects to onboarding
3. **Select archetype** → Creates your profile
4. **See dashboard** → View stats and trends
5. **Test a transaction** → Click "Start Transaction Test"
6. **Fill transaction details** → Amount, type, address
7. **See interceptor modal** → Score, signals, coach message
8. **Confirm or cancel** → Decision is recorded
9. **Dashboard updates** → Trends and stats change

## Architecture

### State Management
- **Zustand** for wallet connection state
- **localStorage** for user profiles and trade history

### AI Coaching
- **Claude 3.5 Sonnet** (via Anthropic API)
- Archetype-specific prompts for personalized tone
- Fallback responses for MVP testing

### Scoring Engine
- **6 parallel signal analyzers** compute independently
- **Weighted average** combines signals (decision speed: 25%, deviation: 20%, etc.)
- **0-100 scale** maps to intervention levels (clean/yellow/orange/block)

### UI Framework
- **Next.js 15+** with App Router
- **shadcn/ui** components
- **Tailwind CSS v4** for styling
- **Recharts** for dashboard charts
- **Lucide React** for icons

## API Reference

### POST /api/coach
Send a transaction score and archetype, get personalized coaching.

**Request:**
```json
{
  "emotionalScore": {
    "score": 75,
    "level": "orange",
    "signals": { ... }
  },
  "userArchetype": "calm-authority",
  "recentTrades": []
}
```

**Response:**
```json
{
  "message": "Your emotional state is elevated. Consider pausing this trade.",
  "tone": "cautionary",
  "archetype": "calm-authority"
}
```

## Security Notes

This MVP uses **localStorage** for data storage. For production:
- Encrypt data with crypto-js or libsodium
- Sync profiles to a backend database
- Use secure session management
- Implement Row Level Security (RLS) for user data

## Future Enhancements

- Real wallet integration (wagmi + RainbowKit)
- Live transaction interception on-chain
- CoinGecko API for real market sentiment
- Achievement NFTs for consistent decision-making
- Weekly email reports
- Mobile app (React Native)
- Multi-language support

## Design Credit

**ALINEA Design System** inspired by the attached brand guide emphasizing dark luxury, purple accents, triangle logo, and "Bloomberg terminal meets watchmaking" aesthetic.

## License

MIT

---

**Built with v0 + Next.js 15 + Claude AI**

For support or feedback, please reach out via GitHub Issues.
