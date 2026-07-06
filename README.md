`TypeScript` `Next.js` `Mongoose` `NextAuth` `License: MIT` `CI` `MCP-Native` `Live at /agent` `Multi-Language` `Vercel-Ready`

# ⚽ INJAFRICA — The Verifiable AI Companion for WC2026

> Natural-language football predictions where every agent action is **MCP-attested, collection-isolated, user-confirmed, scored by humans, and independently auditable** from a separate `AgentPrediction` store.

INJAFRICA is the first **MCP-native bracket companion**. It is not a chat surface that uses AI — it is a verifiable agent layer for an LLM that **scores alongside you, not for you**. Every agent action travels a single primitive — *intent → MCP tool call → isolation check → user confirms → score on real datapoint → public claim* — and ends in an audit row you can inspect in your browser, not a vague reply.

## INJAFRICA refuses to score the AI.

Talk to the agent in English, French, Spanish, Portuguese, or your own words. Debate scorelines, draft picks, ask "can I still overtake the leader?" — all by chatting. But underneath the chat surface, **MCP isolation is required before any AI submission can write anywhere**, not optional plumbing for tool calls.

---

## 🎬 Try INJAFRICA Now →

Sign in with Discord (top right), open **/agent**, and type:

```
predict Brazil 2-1 Scotland
```

Then verify the action yourself in **/profile** — your AgentPrediction row appears in the side-by-side card **next to your manual pick, never on your payouts**.

---

**Features** · **Why INJAFRICA** · **Quick Start** · **Architecture** · **MCP Integration Reference** · **Usage Reference** · **Testing Reference** · **Deploy Guide** · **Project Structure** · **Roadmap**

---

## 🏛 INJAFRICA Architecture

```
                   ┌───────────────────────────────────────────────┐
                   │              Next.js 14 (App Router)          │
                   │                                               │
 Discord OAuth ──▶ │  /agent ───▶ /api/agent-chat ──▶ Groq ReAct  │
                   │         │                       │             │
                   │         │                       ▼             │
                   │         │               /lib/mcp/handlers.ts  │
                   │         │                       │             │
                   │         └─────────▶ /api/mcp  ──▶ JSON-RPC    │
                   │                          (5 tools)           │
                   └──────────────────────────────┬────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │   MongoDB (Mongoose)  │
                                      │                       │
                                      │  Prediction           │ ◀── set-score ONLY
                                      │  AgentPrediction      │ ◀── submit_prediction ONLY
                                      │  User · Match · …      │
                                      └───────────────────────┘
```

Two paths in. One scoring pipeline. **Zero overlap by collection name.**

---

## 🌍 Why INJAFRICA Exists

Most AI prediction tools treat the LLM as a chatbot bolted onto a leaderboard. INJAFRICA treats the LLM as a **constrained agent that drafts alongside you** — and refuses to let it score even if it gets every prediction right.

That is a different product. The defining question is not *"does it understand football?"* (it does, in 5+ languages). It is:

> **What breaks if MCP isolation is removed?**

- Without the **MCP server**, every LLM call would be a free-form string parse — unauditable, unrate-limited, unfalsifiable.
- Without **`AgentPrediction` as a separate collection**, the agent's first bad pick could silently corrupt a leaderboard that's tied to a funded reward pool.
- Without a **published skill file**, every Claude-compatible agent would reinvent the tool order, scoring rules, and tone — drifting from your codebase's truth with every session.

So MCP is not a feature of INJAFRICA. **MCP is the precondition for any AI submission to remain safe.** Read that twice. It is what lets us ship a public-facing agent at all.

### MCP is load-bearing on every feature

| Feature              | Without MCP isolation            | With MCP isolation                                       |
| -------------------- | -------------------------------- | -------------------------------------------------------- |
| AI submit pick       | Silent write into scoring table. | AgentPrediction row, surface-only. Scoring untouched.    |
| Leaderboard math     | AI counts itself into the pool.  | User points stay separate from any agent activity.       |
| Score reconciliation | Manual eyeball compare.          | `set-score` only iterates `Prediction.find({ matchId })`. |
| Audit / proof        | "Trust the AI's reply".          | Same query against the user's own history, by route.     |
| Skill propagation    | Each LLM reinvents strategy.     | `.agents/skills/wc-prediction-strategy` is the source.   |

### Why INJAFRICA can credibly claim this

- **Every tool call, attested.** The MCP server at `/api/mcp` registers five tools against the official `@modelcontextprotocol/sdk` — not a string-parsed JSON route. Clients can call `tools/list` to confirm what they can ask for.
- **Every AI submission, isolated.** `submit_prediction` writes to **`AgentPrediction`** and **only** to `AgentPrediction`. The existing `set-score` flow queries `Prediction.find({ matchId })`, which is structurally blind to agent rows. There is no overlap, even by accident.
- **Every agent row, auditable.** `GET /api/predictions/agent-history` returns the calling user's full AgentPrediction history with `matchId` populated — viewable as a side-by-side card on `/agent` next to manual picks.
- **Every LLM, on the same playbook.** Any Claude-compatible agent loaded with `.agents/skills/wc-prediction-strategy/SKILL.md` follows the same tool order, the same scoring math, the same tone — deterministic across sessions.

---

## ✨ Why INJAFRICA Feels Easy

- **Just chat naturally:** *"Where do I sit on the leaderboard?"* / *"Predict Brazil vs Scotland for me, with a reason."*
- **Works in your language.** English, French, Spanish, Portuguese — and any other tongue the LLM happens to speak. WC2026 is a multi-continent tournament; the agent should be too.
- **Remembers you, not your secrets.** Discord-OAuth identity only. No wallet, no email, no phone. The LLM never sees your private key.
- **Safe by default.** The agent can draft picks (*which you can see*) and read your leaderboard position — but it **cannot increment anybody's `User.points`**, ever.
- **Runs in your browser.** No native app to install. Touch grass, not your phone's storage.
- **Underneath the chat surface, every AI reply cites the tools it called.** So a typo in reasoning is, at worst, a typo in display — never a typo on the leaderboard.

---

## 😌 No More Manual Bracket Stress

- **Forget trivia.** Don't know who Mauritania's striker is? Ask the agent.
- **No fear of losing receipts.** Your picks live in Mongo, your agent's drafts live in Mongo. Both survive server restarts. Both are visible on the same screen.
- **No blind trust in the AI.** Every agent draft sits beside your manual pick in a side-by-side card. You choose what counts.
- **No leaderboard-poisoning LLM.** Even if the agent runs every tool 100 times and submits every plausible scoreline, **`User.points` is unchanged**. That isn't a feature; that's a structural property.

---

## 💡 What INJAFRICA Does

INJAFRICA is feature-rich under the hood, but the surface is one thing: **type what you want, and it happens — and you'll see exactly what happened.** Every action below ends in a side-by-side card on `/agent` or a verifiable feed on `/profile`.

---

## 🛡️ The Verifiable Agent Pipeline

Every agent action travels the same primitive — **one dominant primitive, not a bag of features**:

```
user intent (natural language)
   │
   ▼
1. Discord session         ← NextAuth gates /agent + /api/mcp
   │
   ▼
2. MCP tool dispatch       ← /lib/mcp/handlers.ts (5 Zod-validated tools)
   │                          │
   │                          ├─ 4 read-only: never write
   │                          └─ 1 write:  submit_prediction
   │
   ▼
3. Isolation check         ← submit_prediction writes
                              **`AgentPrediction` ONLY**
                              set-score reads
                              **`Prediction` ONLY**
                              Zero overlap by collection name.
   │
   ▼
4. User confirmation       ← Agent's draft surfaces in the
                              side-by-side card on /agent.
                              User must submit a manual pick on
                              /matches to score.
   │
   ▼
5. Score (admin cron)      ← /api/admin/set-score iterates
                              `Prediction.find({ matchId })`.
                              Agent rows are structurally invisible.
   │
   ▼
6. Points ledger           ← User.points incremented,
                              leaderboard reranked,
                              wallet stamp preserved.
   │
   ▼
7. Public audit            ← /api/predictions/profile
                                + /api/predictions/agent-history
                              Re-renderable from Mongo alone.
```

**INJAFRICA refuses to score the AI.** Submit, swap, draft-request, qualifying guess, and leaderboard queries all emit receipts — but only the manual receipt counts for cash. Use `/receipt` (alias for `/profile`) to list yours, or open any match pair from `/agent`.

### Decision rules (what gets built next)

1. **No new prediction feature** unless it strengthens isolation, auditability, or MCP dependency.
2. **Every feature must answer:** *what breaks if MCP isolation is removed?*
3. **Every demo ends with** a side-by-side comparison card, not a vague "the AI said X" claim.

---

## Feature tour

Here's what rides on top of that primitive — type what you want, see what happened:

### 💬 Just Talk

No commands to learn. The MCP-backed agent understands plain English (and French, Spanish, Portuguese, and 5+ more languages):

```
where am I on the leaderboard?
can I still overtake #1?
predict Brazil 2-1 Scotland — give me a reason
what's the closest upcoming match I haven't predicted?
```

Each reply cites the tools it called. Each tool call is auditable from the same UI.

### 🏆 Discord-Backed Identity — Sign In Once, Stay Recognised

- OAuth via Discord (`AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, scope `identify`).
- On sign-in, your Discord `id`, `username`, `discriminator`, and `avatar` are minted into a NextAuth JWT and upserted into the `User` collection.
- `session.user.points` and `session.user.walletAddress` are **refreshed from Mongo on every JWT decode**; `discordId`/`username`/`avatar` are stamped at first sign-in.
- The `User` collection is the only thing that keeps you anchored across sessions. Lose the JWT, keep your row.

### ⚽ Verified Fixtures — The Ground Truth

- The 73 WC2026 fixtures (group + knockout) are seeded from `src/data/wc2026-fixtures.ts` and surfaced via `GET /api/matches`.
- Each match carries a *business key* like `"A1"` (group A, match 1) plus a stable Mongo ObjectId. The MCP tool resolution path handles either format.
- `matchId` is the unique key joining `Prediction` and `AgentPrediction`. A given `(discordId, matchId)` upserts cleanly — re-submitting replaces the prior row in both collections.

### 📝 Manual Picks — The Human Path

**This is the only path that scores.**

- On `/matches` you fill in `predictedHome`, `predictedAway`, optionally `predictedQualifier` for knockout draws.
- Submit writes one row into **`Prediction`** (coll `predictions`) — unique index `{ discordId, matchId }`.
- When an admin runs `POST /api/admin/set-score` with the real score, the existing iterations only touch `Prediction` rows. Your row gets scored; your `session.user.points` updates on the next JWT refresh.
- Scores mirror `src/lib/points.ts` exactly — five core branches × two draw states = ten outcomes.

### 🤖 AI Agent — The MCP Path

- A chat surface at `/agent` posts to `POST /api/agent-chat`. The handler runs a server-side **Groq** ReAct loop (default model `llama-3.3-70b-versatile`, max 5 iterations, in-memory sliding-window rate limit per `discordId`).
- Every iteration dispatches a tool by name through `/lib/mcp/handlers.ts` — the **same registry** `src/lib/mcp/server.ts` registers against the `@modelcontextprotocol/sdk`. There is one tool source, two transport surfaces (JSON-RPC + Groq).
- The response payload returns `{ assistantMessage, messages, toolTrace }` — the UI chips the tools it called, and if `submit_prediction` appears in the trace, refetches `/api/predictions/agent-history` to refresh the comparison panel.
- Groq API keys live server-side as `GROQ_API_KEY`. The client never sees them.

### 🛡️ Collection Isolation — The Safety Story

This is the **load-bearing safety property**. Read it carefully:

| Collection          | Who writes                              | Who reads                                                                 |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| `predictions`       | `/matches` form, admin seed/reset paths | `set-score` (admin), leaderboard math, profile view                       |
| `agentpredictions`  | **`submit_prediction` MCP tool ONLY**   | `/agent` comparison panel, `/api/predictions/agent-history` (display-only)|

`-` in the cross-product means: **nobody**. That is what makes the system safe even if the agent hallucinates.

| Scenario                                                            | `User.points` outcome |
| ------------------------------------------------------------------- | --------------------- |
| Agent calls `submit_prediction` 100 times, all wrong                | `points` unchanged    |
| Agent calls `submit_prediction` 100 times, all perfect scorelines   | `points` unchanged    |
| Agent calls every read tool 100 times                               | `points` unchanged    |
| You (manual) submit one correct pick on `/matches`                 | `points` increments   |

**No double-counting is possible by construction.** Add to this the fact that the MCP route (and only the MCP route) registers handlers — and that the handlers don't import `Prediction` or `User` writes — and you have a system where a buggy, compromised, or naive agent cannot bump your points or distort the leaderboard.

### 🧠 Authorless Skill — The Playbook

- `.agents/skills/wc-prediction-strategy/SKILL.md` is a YAML-frontmatter Markdown file describing exactly how any Claude-compatible agent should reason about WC2026 INJAFRICA questions.
- It pins the tool-call order (`get_user_points` → `get_leaderboard` → `get_upcoming_matches`), the scoring table (mirror of `src/lib/points.ts`), the gap-closing math (`C_conservative = R × 6`, `C_generous = R × 8`, `C_ceiling = R × 10`), and the tone.
- **Stable frontmatter trigger keywords** (`leaderboard rank`, `agent prediction`, `WC2026`, etc.) keep this skill from firing on unrelated queries. Stable content keeps it accurate when the codebase drifts.
- The skill is **content**, not source-of-truth for tool surfaces. The MCP server (`/api/mcp`) is. The skill just teaches any LLM how to use that surface.

### 🏅 Leaderboard — The Public Score

- `GET /api/leaderboard` returns top N players sorted by `points` desc, ties broken by `createdAt` asc.
- `GET /api/players/[discordId]` returns a public profile for any registered player.
- `/leaderboard` UI is the canonical place to see who is leading and who is falling behind.
- The gap-closing math (see the skill file) is what the agent uses to answer *“can I still overtake?”* with real numbers, not vibes.

### 💰 Wallet — Optional, Not Required

- `/profile` carries a wallet form. Save once, it stays on your row.
- `session.user.walletAddress` is refreshed from Mongo on every JWT decode — the wallet stamp doesn't disappear when the session does.
- The wallet isn't required to play. INJAFRICA is for predictions first; the wallet is for whoever wants a private reward path.

### 🔧 Admin Panel — For Operators Only

The `/adminTebas` route gates on `ADMIN_DISCORD_IDS` (comma-separated env). Inside:

- **Create match** — `POST /api/admin/create-match`
- **Set score** — `POST /api/admin/set-score` *(the only path that touches `User.points`)*
- **Toggle tournament status** — `POST /api/admin/tournament-status`
- **Reset points** — `POST /api/admin/reset-points`
- **Inspect users** — `GET /api/admin/users`
- **Inspect wallets** — `GET /api/admin/wallets`
- **Seed (dev only)** — `POST /api/admin/seed`

### 🤖 AI Tools — The Depth Under the Hood

The MCP server exposes **5 LLM-callable tools** at `src/lib/mcp/handlers.ts`, dispatched verbatim by `src/lib/mcp/tools.ts` (MCP transport) and `src/lib/mcp/groq-tools.ts` (Groq transport). The single registry is enforced by `Object.entries(handlers).forEach(...)`:

| Tool                                                       | Purpose                                                          | Mutates?                  |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------- |
| `get_leaderboard({ limit?: 1..100 })`                      | Top N ranked by points.                                          | 🔒 read-only              |
| `get_user_points()`                                        | Caller's points + global rank.                                   | 🔒 read-only              |
| `get_upcoming_matches({ limit?: 1..100 })`                 | Scheduled (open) matches sorted by `matchDate`.                  | 🔒 read-only              |
| `submit_prediction({ matchId, predictedHome, predictedAway, predictedQualifier?, note? })` | Upserts one row into **`AgentPrediction`**. Never touches `Prediction` or `User.points`. | ✏️ write isolated         |
| `get_scoring_rules()`                                      | Text mirror of `src/lib/points.ts`.                              | 🔒 read-only              |

**No tool that touches `User.points`.** That's a registry-level guarantee, not a per-call promise. New tools added to the registry inherit the same property by construction unless somebody deliberately imports `User`'s update path into a handler — and code review should flag that immediately.

---

## ⚡ Progressive UX

- Side-by-side comparison cards on `/agent` render the agent's draft next to your manual pick on the same screen.
- Tool chips under the chat surface name the tools the agent just called; hover for the first 240 chars of the response.
- A yellow "just submitted" highlight marks drafts written within the last five minutes so you know which side of the card to look at first.
- `<Image>` next-avatar rendering means Discord avatars load instantly without exposing your CDN traffic to the agent.

---

## 🔒 Security & Isolation Guarantees

- **Discord OAuth only** (no email/password). JWT secret in `AUTH_SECRET`.
- **Agent writes isolated to `AgentPrediction`.** `set-score` reads `Prediction` only. Cross-product ≠ 0 is a regression we ship-test in CI.
- **`/api/mcp` is NextAuth-gated.** Every `tools/call` is shape-checked by Zod before dispatch. Auth-checked handler-level.
- **`/api/predictions/agent-history` is auth-gated** to the caller's `discordId`. No user can read another user agent-history.
- **All MCP routes run on the Node.js runtime** (Mongoose + WebStandard transport require it).
- **The Groq key never reaches the client.** It lives server-side as `GROQ_API_KEY`; the client posts to `/api/agent-chat` and gets `{ assistantMessage, messages, toolTrace }` back.
- **No sensitive wallets/private keys** in the LLM context. The wallet address is a public display field; never used for signing on behalf of the user.

---

## 🧪 Reference Tooling

### 🧬 Smoke test (one-shot, in-memory)

`npm run smoke:mcp` runs `scripts/smoke-mcp-auth.mjs`, which spins up `MongoMemoryServer`, runs an in-memory mongod, seeds one user + one future-dated match, spawns `next dev`, mints a real NextAuth v5 JWT via `next-auth/jwt`, POSTs JSON-RPC `tools/call submit_prediction` against `/api/mcp`, GETs `/api/predictions/agent-history`, and asserts the isolation invariants (`User.points === 0`, `Prediction` count is 0, `AgentPrediction` count is 1, response text contains `"isolated": true`).

The script temporarily renames the project `.env` to `.env.smoke-backup` so Next.js's dotenv-loader can't override the smoke MONGODB_URI with a baked-in dev value. Restores in cleanup with `process.on('exit')` fallback.

Run with:

```bash
npm run smoke:mcp
```

### Linting / typechecking

```bash
npm run lint
npx tsc --noEmit
```

### Local dev loop

```bash
npm run dev          # http://localhost:3000
npm run build && npm run start
```

---

## 🚀 Deploy Guide

INJAFRICA is a standard Next.js 14 app. Anything that runs Next 14 + Node 18+ + a reachable MongoDB works.

1. **Environment**

   ```bash
   AUTH_SECRET=…                         # NextAuth JWT signing
   AUTH_DISCORD_ID=…                     # Discord OAuth
   AUTH_DISCORD_SECRET=…                 # Discord OAuth
   MONGODB_URI=mongodb+srv://…           # MongoDB connection string
   GROQ_API_KEY=…                        # For /api/agent-chat only
   ADMIN_DISCORD_IDS=…                   # Comma-separated, gates /adminTebas
   ```

2. **Database**

   - Mongoose models `Match`, `Prediction`, `User`, `Settings`, `AgentPrediction` auto-register on first import.
   - Fixtures seed from `src/data/wc2026-fixtures.ts` (run `POST /api/admin/seed` on first deploy).
   - No migrations. Schema versioning is `mongoose.Schema({ timestamps: true })`.

3. **Build**

   ```bash
   npm install
   npm run build
   npm run start
   ```

4. **Smoke test on a fresh deploy**

   ```bash
   npm run smoke:mcp
   ```

   Connects to `process.env.MONGODB_URI`, exercises the full MCP round-trip, asserts isolation invariants. Should pass on any environment that can run `next dev` + `next-auth`.

---

## 🗂 Project Structure

```
injafrica/
├── .agents/
│   └── skills/
│       └── wc-prediction-strategy/
│           └── SKILL.md              # Authorless skill for any Claude-compatible agent
├── scripts/
│   └── smoke-mcp-auth.mjs            # End-to-end in-memory MCP smoke test
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── mcp/route.ts          # JSON-RPC MCP transport (NextAuth-gated)
│   │   │   ├── agent-chat/route.ts   # Server-side Groq ReAct loop
│   │   │   ├── predictions/{profile,agent-history}/route.ts
│   │   │   ├── admin/{seed,set-score,create-match,reset-points,tournament-status,users,wallets,me}/route.ts
│   │   │   ├── matches/{route.ts,[id]/route.ts}
│   │   │   ├── leaderboard/route.ts
│   │   │   ├── players/[discordId]/route.ts
│   │   │   ├── wallet/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── agent/page.tsx           # In-site chat UI
│   │   ├── matches/page.tsx         # Manual picks form
│   │   ├── qualification/page.tsx    # Knockout qualifier predictions
│   │   ├── leaderboard/page.tsx
│   │   ├── profile/page.tsx          # Wallet + manual picks history
│   │   ├── dashboard/page.tsx        # Points ticker + summaries
│   │   ├── players/[discordId]/page.tsx
│   │   ├── adminTebas/page.tsx       # Admin-only console
│   │   └── not-authorized/page.tsx
│   ├── components/
│   │   ├── AgentComparisonCard.tsx  # Side-by-side manual vs agent pick
│   │   ├── AuthButton.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── MatchCard.tsx
│   │   ├── Navbar.tsx
│   │   ├── PointsTicker.tsx
│   │   ├── PredictionForm.tsx
│   │   └── QualificationForm.tsx
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth v5 (Discord) + JWT + session callbacks
│   │   ├── mongodb.ts                # Cached Mongoose connection
│   │   ├── points.ts                 # Scoring rules (load-bearing)
│   │   └── mcp/
│   │       ├── handlers.ts           # 5 MCP tools, single source of truth
│   │       ├── tools.ts              # Registers handlers on McpServer
│   │       ├── server.ts             # Builds McpServer per request
│   │       └── groq-tools.ts         # OpenAI/Groq-format parallel tool defs
│   ├── models/
│   │   ├── Match.ts
│   │   ├── Prediction.ts             # Manual picks (SCE scoring)
│   │   ├── AgentPrediction.ts        # Agent drafts (NEVER scored)
│   │   ├── User.ts
│   │   └── Settings.ts
│   ├── data/wc2026-fixtures.ts       # 73 WC2026 fixtures (group + knockout)
│   └── types/index.ts
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🛣 Roadmap

- **/agent replay** — surface prior agent turns with their tool traces.
- **Tournament-level chat memory** — pre-loaded skill seeder for any new Claude-compatible agent so they don't re-read the SKILL.md every session.
- **Wallet-gated reward payouts** — currently display-only; reward disbursement is on the operator's separate cron.
- **Per-tournament skill** — fork the skill file when the WC26 tournament ends so WC30 doesn't inherit stale scoring math.
- **Visualisation** — render the side-by-side comparison card with diff-coloured score deltas.

---

**INJAFRICA refuses to score the AI.** A chat surface that grades itself is not a chat surface — it's an oracle. We ship a constrained agent instead, and the receipts prove it.
