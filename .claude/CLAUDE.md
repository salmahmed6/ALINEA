# Alinea — Claude Developer Instructions

> **"Your agent for aligned decisions"**
> An AI coach embedded in a crypto wallet that intercepts emotional trades before they hit the blockchain.

This file is the single source of truth for any AI assistant working on this codebase.
Read it fully before writing any code, editing any file, or answering any question about the project.

---

## What This Project Is

Alinea is a Next.js 14 full-stack web application. There is **one repo** containing both frontend and backend.
The backend is entirely Next.js API routes — no separate server.

**Core flow:**
1. User connects wallet (wagmi + RainbowKit)
2. User completes 10-question onboarding → assigned an investor archetype
3. User initiates a trade on the `/trade` page
4. **Before** the tx reaches the blockchain, `alineaHook()` in `src/lib/sdk/hook.ts` intercepts it
5. 6 behavioral signals are computed and combined into an emotional score (0–100)
6. If score ≥ 40, Claude generates a personalized coach message via `/api/coach`
7. The `CoachOverlay` component shows the message and lets the user cancel or confirm
8. The decision is logged and the user's profile learns over time

---

## Project Structure

```
src/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Landing / wallet connect
│   ├── onboarding/page.tsx      # 10-question profile setup
│   ├── dashboard/page.tsx       # History, stats, archetype
│   ├── trade/page.tsx           # Trade UI + hook integration
│   └── api/
│       ├── coach/route.ts       # POST — Claude AI coach message
│       ├── market/route.ts      # GET  — Fear & Greed + price data
│       ├── decisions/route.ts   # POST/GET — decision log
│       └── onboarding/route.ts  # POST — profile creation
├── components/
│   ├── WalletProvider.tsx       # wagmi + RainbowKit config
│   ├── CoachOverlay.tsx         # Intervention popup
│   └── ProfileCard.tsx          # Archetype display card
├── lib/
│   ├── sdk/
│   │   ├── signals.ts           # 6 behavioral signal functions
│   │   ├── score.ts             # Weighted scoring + level classifier
│   │   └── hook.ts              # Main intercept function (alineaHook)
│   ├── profile/
│   │   ├── archetypes.ts        # 4 archetypes + assignArchetype()
│   │   └── storage.ts           # AES-256 encrypted localStorage
│   ├── ai/
│   │   └── coach.ts             # System prompt + user message builder
│   ├── store.ts                 # Zustand global state
│   └── utils.ts                 # cn(), formatUSD(), scoreToEmoji(), etc.
└── types/
    └── index.ts                 # ALL shared TypeScript types
```

---

## Rules You Must Follow

### 1. Never modify these files without asking first
- `src/types/index.ts` — changing types breaks the entire chain
- `src/lib/sdk/score.ts` — weight changes affect scoring behavior
- `.env.local.example` — it documents what keys exist

### 2. Always use the type system
- Import types from `@/types` — never inline ad-hoc interfaces
- Never use `any` unless there is a documented reason in a comment
- `Transaction`, `UserProfile`, `InterventionLevel` are the core types

### 3. API routes must never crash
- Every API route (`/api/coach`, `/api/market`, `/api/decisions`) must have a try/catch
- `/api/coach` must always return a fallback message string, never a 500
- `/api/market` must return neutral values (fearGreedIndex: 50) on failure

### 4. The hook must fail open
- If `computeEmotionalScore()` throws, the trade must proceed — never block a user's money
- If `fetchCoachMessage()` fails, use the hardcoded fallback string

### 5. Storage is client-side only
- `src/lib/profile/storage.ts` uses `localStorage` — never call it from a server component or API route
- Always guard with `if (typeof window === 'undefined') return`

### 6. Keep coach messages short
- The Claude API call in `/api/coach/route.ts` has `max_tokens: 150`
- Do not increase this — long messages don't get read during a trade

### 7. Tailwind only — no inline styles
- Use `cn()` from `@/lib/utils` for conditional class merging
- Brand colors: `brand-500` is primary purple (`#5B4FCF`)
- Score colors: `score-clean`, `score-yellow`, `score-orange`, `score-block`

---

## Environment Variables

| Variable | Where Used | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | `/api/coach/route.ts` (server only) | ✅ |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `WalletProvider.tsx` | ✅ |
| `COINGECKO_API_KEY` | `/api/market/route.ts` (server only) | ⚠️ free tier |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | `storage.ts` | ✅ |
| `NEXT_PUBLIC_APP_URL` | Metadata / og tags | optional |

**Never log, expose, or commit any of these values.**

---

## Key Functions Reference

### `alineaHook(tx, profile, sessionStartTime, onIntervention, proceedWithTx)`
Location: `src/lib/sdk/hook.ts`
The main intercept. Call this instead of `sendTransaction` in the trade UI.
- Calls `computeEmotionalScore()` → gets level
- If `clean`: calls `proceedWithTx()` silently
- If not clean: fetches coach message → calls `onIntervention()`

### `computeEmotionalScore(tx, profile, sessionStartTime)`
Location: `src/lib/sdk/score.ts`
Returns a `ScoreResult` with `{ raw, multiplier, final, level, signals }`.

### `getInterventionLevel(score)`
Location: `src/lib/sdk/score.ts`
- < 40 → `clean`
- < 70 → `yellow`
- < 90 → `orange`
- ≥ 90 → `block`

### `assignArchetype(answers)`
Location: `src/lib/profile/archetypes.ts`
Maps 10 onboarding answers to one of: `strategist | emotional | conservative | novice`

### `saveProfile / loadProfile / updateProfile`
Location: `src/lib/profile/storage.ts`
AES-256 encrypted localStorage. Always call `updateProfile()` to mutate rather than save/load manually.

---

## Claude API Usage

Model: `claude-sonnet-4-20250514`
Max tokens: `150` (keep short — intervention messages must be glanceable)
The system prompt lives in `src/lib/ai/coach.ts` → `ALINEA_SYSTEM_PROMPT`.

**Tone rules for the coach prompt:**
- 2–3 sentences maximum
- Always reference a specific number from the user's data
- Always end with a reflective question
- Never say "no" or tell the user what to do
- No generic phrases ("be careful", "think twice")

---

## Running Locally

```bash
# 1. Install
pnpm install

# 2. Set up env
cp .env.local.example .env.local
# Fill in your actual keys

# 3. Start dev server
pnpm dev
# → http://localhost:3000

# 4. Test the coach endpoint
curl -X POST http://localhost:3000/api/coach \
  -H "Content-Type: application/json" \
  -d '{
    "tx":      { "asset": "dogecoin", "amountUSD": 620, "side": "buy", "to": "0x0", "value": "0" },
    "profile": {
      "archetype": "emotional",
      "strategy":  { "maxPositionUSD": 80, "maxPositionPercent": 5, "preferredAssets": [], "tradingHours": { "start": 8, "end": 22 } },
      "portfolioValue": 1600,
      "avgDailyTrades": 2,
      "history": [{ "asset": "dogecoin", "result": "loss", "percentPnL": 38, "conditions": { "timeOfDay": "night" }, "amountUSD": 500, "side": "buy", "score": 85, "level": "orange", "outcome": "approved", "timestamp": 1700000000000, "id": "abc" }],
      "id": "test", "walletAddress": "0xtest", "onboardedAt": 1700000000000,
      "weeklyStats": { "avgEmotionalScore": 0, "totalTrades": 0, "cancelledAfterWarning": 0, "topRiskyHour": 23, "scoreImprovement": 0, "insights": [] }
    },
    "score": 91,
    "level": "block"
  }'
```

---

## Testing

```bash
pnpm test          # run all tests
pnpm test:watch    # watch mode
pnpm test:ci       # CI mode with coverage
```

Tests live alongside source files: `src/lib/sdk/signals.test.ts` etc.

---

## Git Branches

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys to Vercel |
| `develop` | Integration branch — creates preview deploy |
| `feature/*` | New features — PR into develop |
| `fix/*` | Bug fixes — PR into develop |
| `hotfix/*` | Critical prod fixes — PR into main |

---

## What Is NOT Built Yet (your sprint tasks)

See `.claude/SPRINTS.md` for the full task breakdown.
Short version of what still needs building in each file:

- `src/app/api/decisions/route.ts` — replace in-memory Map with persistent DB (SQLite or Vercel KV)
- `src/lib/sdk/signals.ts` — `getHistoricalReversalScore` needs full condition matching
- `src/app/dashboard/page.tsx` — weekly insights section (top 3 behavioral patterns)
- `src/components/ProfileCard.tsx` — sparkline score trend chart
- Achievement NFT minting (stretch goal)
- Weekly email report (stretch goal)

---

## Questions?

If something is unclear, check `.claude/ARCHITECTURE.md` for the system diagram,
or `.claude/DECISIONS.md` for why specific choices were made.
