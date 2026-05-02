# Alinea — Sprint Task Reference

Use this file to track what is built, what is in progress, and what remains.
Update checkboxes as tasks are completed.

---

## Sprint 1 — Setup & Infrastructure (Days 1–3)
### Backend
- [x] package.json with all dependencies
- [x] tsconfig.json
- [x] next.config.ts
- [x] .env.local.example
- [x] .gitignore
- [x] jest.config.ts + jest.setup.ts
- [x] src/types/index.ts — all shared types

### Frontend
- [x] tailwind.config.ts with brand colors
- [x] postcss.config.js
- [x] src/app/globals.css
- [x] src/app/layout.tsx
- [ ] Add Google Fonts Inter import (check layout.tsx font loading)
- [ ] Confirm all placeholder pages render without error at localhost:3000

---

## Sprint 2 — Core Backend Logic (Days 4–7)
### Signal Engine
- [x] src/lib/sdk/signals.ts — all 6 signal functions
- [x] src/lib/sdk/score.ts — weighted formula + level classifier
- [x] src/lib/sdk/hook.ts — alineaHook() intercept
- [ ] src/lib/sdk/signals.test.ts — unit tests for all 6 signals
- [ ] src/lib/sdk/score.test.ts — unit tests for computeEmotionalScore()

### API Routes
- [x] src/app/api/coach/route.ts
- [x] src/app/api/market/route.ts — with 5min cache
- [x] src/app/api/decisions/route.ts — in-memory (TODO: persist)
- [x] src/app/api/onboarding/route.ts
- [ ] Replace in-memory decisions store with Vercel KV or SQLite

### Profile & Storage
- [x] src/lib/profile/archetypes.ts — 4 archetypes + assignArchetype()
- [x] src/lib/profile/storage.ts — AES-256 encrypted localStorage
- [x] src/lib/ai/coach.ts — system prompt + message builder
- [ ] src/lib/profile/storage.test.ts — unit tests
- [ ] src/lib/profile/archetypes.test.ts — unit tests

---

## Sprint 3 — Frontend UI (Days 8–11)
### Wallet & State
- [x] src/components/WalletProvider.tsx
- [x] src/lib/store.ts — Zustand store
- [ ] Test wallet connect on Sepolia testnet

### Pages
- [x] src/app/page.tsx — landing
- [x] src/app/onboarding/page.tsx — 10 questions + portfolio + archetype result
- [x] src/app/dashboard/page.tsx — stats + history
- [x] src/app/trade/page.tsx — trade UI + hook integration
- [ ] Add toast notification for clean trades ("✓ score was 22")
- [ ] Add empty state illustrations
- [ ] Mobile responsive check (375px)

### Components
- [x] src/components/CoachOverlay.tsx — with timer, pattern reveal, block confirmation
- [x] src/components/ProfileCard.tsx
- [ ] Add score sparkline chart to ProfileCard (recharts or simple SVG)
- [ ] src/components/ui/ — extract reusable Button, Badge, Card components

---

## Sprint 4 — Integration, Testing & Deploy (Days 12–14)
### Integration
- [ ] Wire logDecision() call in trade/page.tsx after every outcome ✓ (partial)
- [ ] Verify full end-to-end flow: connect → onboard → trade → overlay → dashboard
- [ ] Test all 4 scenarios: clean / yellow / orange / block

### Hardening
- [ ] Add Zod validation to all API route bodies
- [ ] Rate limit /api/coach (10 req/session)
- [ ] Add error boundaries to all pages

### Deploy
- [ ] Create Vercel project linked to GitHub repo
- [ ] Add all env vars in Vercel dashboard
- [ ] Verify CI passes on GitHub Actions
- [ ] Verify CD deploys to production URL
- [ ] Record demo video

---

## Stretch Goals (post-sprint)
- [ ] Achievement NFT minting on successful "save this pattern" decision
- [ ] Weekly behavioral email report
- [ ] Multi-wallet support
- [ ] Dark mode
- [ ] Mobile app (React Native with wagmi)
