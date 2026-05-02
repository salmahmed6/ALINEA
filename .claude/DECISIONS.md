# Alinea — Decision Log

Key architectural choices and why they were made.
Read this before changing any of these patterns.

---

## Why Next.js API routes (not a separate backend)?

**Decision:** All backend logic lives in `src/app/api/` as Next.js route handlers.

**Why:** This is a hackathon / MVP. One repo, one deploy, zero DevOps.
Vercel handles both the frontend and the serverless API functions together.
When the project scales, extracting to a separate service is straightforward.

---

## Why localStorage (not a database)?

**Decision:** User profiles and decision history are stored in encrypted localStorage.

**Why:** No user accounts, no database setup, no GDPR complexity for the MVP.
The encryption (AES-256 via crypto-js) means even if localStorage is inspected,
the data is unreadable without the encryption key.

**When to change:** When we need cross-device sync, multi-wallet support,
or server-side analytics. Replace `storage.ts` with API calls to a DB.

---

## Why wagmi v2 + RainbowKit (not Web3Modal or ConnectKit)?

**Decision:** wagmi v2 + viem + RainbowKit.

**Why:** wagmi v2 is the current standard. RainbowKit is the most polished
wallet connect UI and has first-class wagmi integration. viem replaces ethers.js
and is faster and more type-safe.

---

## Why Zustand (not Redux or Context)?

**Decision:** Zustand for global state.

**Why:** The intervention overlay state needs to be triggered from the SDK hook
and consumed by a UI component — they're not in a parent/child relationship.
Zustand is the simplest solution for this cross-component state without boilerplate.

---

## Why claude-sonnet-4-20250514 (not Opus)?

**Decision:** Use Sonnet, not Opus, for the coach endpoint.

**Why:** Coach messages are 2–3 sentences and triggered in real-time before
a trade. Latency matters. Sonnet is fast enough and the task (short personalized
message) does not require Opus-level capability. Opus would add ~2s latency.

---

## Why max_tokens: 150 for the coach?

**Decision:** Hard cap at 150 tokens.

**Why:** Intervention messages must be read in seconds, during the emotional
moment of a trade. Research shows people don't read long messages at moments
of high arousal. If the message doesn't fit in 3 sentences, it won't be read.

---

## Why no server-side session / auth?

**Decision:** No authentication layer.

**Why:** The wallet IS the identity. `walletAddress` is the user ID.
Adding JWT/session on top would add complexity without security benefit
since all sensitive data is local anyway.

---

## Why AES-256 for localStorage?

**Decision:** Encrypt all localStorage values with AES-256 before storing.

**Why:** If a malicious extension or XSS reads localStorage, raw trade
history and behavioral data would be exposed. AES-256 with a per-user
key adds a meaningful layer of protection. It's not perfect (the key
is in the JS bundle) but it's appropriate for this data sensitivity level.
