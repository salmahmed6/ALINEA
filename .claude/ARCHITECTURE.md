# Alinea — Architecture Reference

## System Overview

```
Browser
  │
  ├── /             → Landing + wallet connect (RainbowKit)
  ├── /onboarding   → 10-question profile builder
  ├── /dashboard    → History, stats, archetype card
  └── /trade        → Trade UI
        │
        │  [User hits "Confirm Trade"]
        │
        ▼
  alineaHook()                    ← src/lib/sdk/hook.ts
        │
        ├── computeEmotionalScore()  ← src/lib/sdk/score.ts
        │     ├── getDecisionSpeed()
        │     ├── getTimeOfDayScore()
        │     ├── getStrategyDeviation()
        │     ├── getHistoricalReversalScore()
        │     ├── getFrequencyScore()
        │     └── getMarketContextMultiplier() → GET /api/market
        │
        ├── [score < 40] → proceedWithTx() silently
        │
        └── [score ≥ 40] → POST /api/coach
                                │
                                ▼
                         Anthropic Claude API
                         (claude-sonnet-4-20250514)
                                │
                                ▼
                         CoachOverlay renders
                         ┌─────────────────┐
                         │  Cancel         │  → logDecision('cancelled')
                         │  Confirm anyway │  → proceedWithTx() + logDecision('approved')
                         └─────────────────┘
                                │
                                ▼
                         POST /api/decisions
                         saveDecision() → encrypted localStorage
```

## Data Flow

```
UserProfile (localStorage, AES-256)
  └── history: TradeRecord[]      ← grows with each trade
  └── weeklyStats: WeeklyStats    ← computed from history

Decision (localStorage + /api/decisions)
  ← logged after every trade interaction

MarketData (/api/market, cached 5min)
  ← fetched during score computation
```

## State Management

```
Zustand Store (src/lib/store.ts)
  ├── profile          ← loaded from localStorage on mount
  ├── sessionStartTime ← set on page load (used for decision speed signal)
  ├── intervention     ← { active, score, level, message, recentTrades }
  └── walletAddress    ← from wagmi useAccount()
```

## API Routes

```
POST /api/coach
  ← { tx, profile, score, level }
  → { message: string }           ← Claude-generated, ≤150 tokens

GET  /api/market
  ← ?asset=bitcoin
  → { fearGreedIndex, priceChange24h, asset, fetchedAt }
  [5-min in-memory cache]

POST /api/decisions
  ← { userId, tx, score, outcome, message, timestamp }
  → { ok: true, id: string }

GET  /api/decisions
  ← ?userId=xxx
  → { history: Decision[] }

POST /api/onboarding
  ← { walletAddress, answers, portfolioValue }
  → { profile: UserProfile, archetype: ArchetypeId }
```

## Security Model

- **No wallet private keys** ever touch Alinea — wagmi handles signing
- **No server-side user data** — profile lives in encrypted localStorage
- **No PII** — only wallet address (public) is used as identifier
- **API keys** are server-side only (ANTHROPIC_API_KEY, COINGECKO_API_KEY)
- **Encryption key** is NEXT_PUBLIC but only used client-side for AES operations
