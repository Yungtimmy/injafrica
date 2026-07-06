---
name: wc-prediction-strategy
description: Use this skill whenever asked about leaderboard standing, point gaps, ranking, catching up to the leader, or strategic World Cup 2026 match prediction questions inside the INJAFRICA WC2026 prediction game. Trigger on queries mentioning "leaderboard rank", "ranking", "catch up", "overtake", "can I still win", "points gap", "WC2026", "INJAFRICA", "World Cup prediction", "agent prediction", or any specific team-vs-team match in the tournament. Do NOT trigger for manual pick submission, wallet link, or admin tasks; those go through direct site routes.
---

# WC2026 INJAFRICA Prediction Strategy

## 1. CRITICAL isolation fact (read this first)

The Africp tool `submit_prediction` writes to a **separate MongoDB collection called `AgentPrediction`** that is **invisible** to the scoring system.

- `User.points` is increased ONLY by the admin `set-score` flow, which iterates the `Prediction` collection.
- `AgentPrediction` rows are never read by `set-score`, never summed into leaderboard totals, never earn points.
- Two scenarios both leave `User.points` unchanged:
  - The agent submits via `submit_prediction` 100 times.
  - The agent runs every read tool 100 times.
- The user must submit their own pick from `/matches` (writes to `Prediction`) to earn real points.
- This rule is non-negotiable. Always surface it after a `submit_prediction` call so the user is not confused.

## 2. Available tools

The Africp server exposes five tools. Use them in this order for a typical strategy query:

| Tool | Purpose | Returns shape |
|---|---|---|
| `get_leaderboard({ limit?: 1..100 })` | Top N players by points (default 25). | JSON array: `{ rank, discordId, username, avatar, points }[]` |
| `get_user_points()` | Caller's own points + global rank. No params. | JSON: `{ discordId, username, avatar, points, rank }` |
| `get_upcoming_matches({ limit?: 1..100 })` | Scheduled matches not yet finished/live. Sorted by date. | JSON array: matches with `matchId` (business key like "A1"), `homeTeam`, `awayTeam`, `group`, `stage`, `matchDate`, `venue`, `city`. |
| `submit_prediction({ matchId, predictedHome, predictedAway, predictedQualifier?, note? })` | Upserts into `AgentPrediction` only. | JSON: `{ ok, isolated, message, agentPrediction }` |
| `get_scoring_rules()` | Static scoring text. | Plain text only. |

### Recommended tool-call order

- **Strategy / "can I catch up?"** — `get_user_points()` → `get_leaderboard({ limit: 25 })` → `get_upcoming_matches({ limit: 20 })`. Optionally `get_scoring_rules()` only if branch values are unclear.
- **"Predict Brazil vs Scotland"** — `get_upcoming_matches({ limit: 5 })` (resolve the team pair to a `matchId`) → `submit_prediction(...)`.
- **"Show me the leaderboard"** — `get_user_points()` (so you can highlight the caller) → `get_leaderboard({ limit: 10 })`.
- **"Why didn't my submission count?"** — surface the isolation fact directly. Do NOT call any tool; answer from this skill alone.

## 3. Scoring rules (mirror of src/lib/points.ts)

Per finished match, by outcome-vs-prediction comparison. "Outcome" = home-win / away-win / draw.

| Outcome match? | Score exact? | Qualifier? | Points |
|---|---|---|---|
| ✗ | ✗ | ✗ | 0 |
| ✗ | — | ✓ | 2 |
| ✓ | ✗ (draw) | — | 3 |
| ✓ | ✗ (non-draw) | — | 1 |
| ✓ | — | ✓ (draw) | 5 |
| ✓ | — | ✓ (non-draw) | 3 |
| — | ✓ (draw) | ✗ | 8 |
| — | ✓ (non-draw) | ✗ | 6 |
| — | ✓ (draw) | ✓ | 10 |
| — | ✓ (non-draw) | ✓ | 8 |
Plus: **+2 points per correctly guessed group-stage advancer** at the knockout boundary.

Realistic per-match ceilings for strategy math:
- Conservative (correct-score non-draw only): **6 pts / match**
- Generous (correct-score non-draw with qualifier): **8 pts / match**
- Best case (correct-score draw with qualifier): **10 pts / match**
- No draw bias assumed: typical performance is **1–3 pts / match**.

## 4. Gap-closing math (use to answer "can I catch up?")

### Step 1 — anchor

- Caller's points `U` from `get_user_points()`.
- Target rank's points `T` from `get_leaderboard()`.
- Remaining scheduled matches `R` from `get_upcoming_matches()`.

### Step 2 — compute ceilings

```
C_conservative = R × 6   // correct-score non-draw, no qualifier win
C_generous     = R × 8   // correct-score non-draw, with qualifier
C_ceiling      = R × 10  // correct-score draw, with qualifier (rare)
```

### Step 3 — categorize

For deficit `D = T − U`:

1. **Mathematically impossible:** `D > C_ceiling`. State plainly that no path exists, even with a perfect run.
2. **Requires leader to falter:** `D ≤ C_ceiling` AND `D > 0`. The agent could catch them IF the leader earns zero more. Phrase as "possible but contingent on the leader missing every remaining pick."
3. **Comfortable:** `D ≤ R × 2` (≈ 12 pts for 10 matches). Almost any realistic run closes the gap.

### Step 4 — present the math

Show numbers, not vibes. Example response structure:

> "You have **42 pts**, the #1 leader has **67 pts**. Deficit: **25**. There are **16 scheduled matches** left. Maximum realistic ceiling for you: **16 × 6 = 96 pts** if you nail every score. The leader can also keep scoring. To overtake, you'd need the leader to miss most remaining matches AND you to convert at near-ceiling. Probability is low but not zero. Targeted high-confidence matches (top teams, clear favorites) are your best leverage."

Always cite the numbers. Always cite the tools you used.

## 5. Tone and response format

- **Brief.** Plain language, no sportsbook/finance jargon. One paragraph unless the user asks for detail.
- **Cite the tools you called.** So the user understands what actually happened: "via `get_user_points()` + `get_leaderboard()`…"
- **After `submit_prediction`, ALWAYS repeat the isolation fact** in one short clause: *"Draft only — submit your own pick on `/matches` to earn X points."*
- **Never invent team names.** Always pull from a tool result.
- **When tools return `isError: true`,** surface the message inline as one line, then continue with whatever else worked.
- **For ambiguity, surface options** with their expected payoff rather than picking one.

## 6. Decision shortcut (when the user just wants a recommendation)

| User's situation | Recommended action |
|---|---|
| Behind in points, far from leader | Target high-confidence score predictions on remaining matches. Skip low-confidence long-shot picks. |
| Inside top 5, in striking distance | Predict every remaining match. Maximize ceiling. |
| Mid-pack, leader unreachable | Focus on group-stage qualifier picks to bank consistent 1–3 pt margins. |
| User asks "predict X for me" | Confirm match is open (status `scheduled`, kickoff in future) via `get_upcoming_matches`, then call `submit_prediction`. Always pass a `note` explaining the reasoning — it surfaces on the side-by-side card. |

## 7. What this skill is NOT for

- **Manual pick submission** — direct to `/matches`. The Africp tools don't replace the human-facing form.
- **Wallet submission** — direct to `/profile`. Out of scope for predictions entirely.
- **Admin work** — score entry, tournament toggle, user management. Out of scope.
- **Other tournaments or sports** — only FIFA WC 2026 / INJAFRICA data exists.

## 8. Stability note for LLM context

This skill is deterministic content, not a tool source. The **live tool registry** is what the Africp server exposes (`/api/africp`); if the tool list ever expands, prefer to read `/api/africp`'s `tools/list` instead of trusting this file alone.

## 9. Offline Bundle (no live Africp endpoint)

If `/api/africp` is unreachable or the installing agent has no authenticated Discord session, this skill can still produce non-empty reasoning by reading the static bundle that ships with the repo (served from `public/`):

| URL | Replaces tool | Notes |
|---|---|---|
| `/wc2026-fixtures.json` | `get_upcoming_matches` | All 72 group-stage WC2026 matches. Rows are grouped by group letter (A→L); offline reasoning MUST sort the array by `matchDate` ascending to mirror the live tool's behavior. |
| `/wc2026-leaderboard-snapshot.json` | `get_leaderboard` | Top-10 synthetic snapshot. `_meta.syntheticData: true` — surface that fact to the user and don't treat any username as a real player. The fixtures file is **not** synthetic (it carries real WC2026 group-stage data); only the leaderboard file is. |
| `/wc2026-fixtures-bundle/index.json` | n/a | Manifest listing both URLs plus loader hints and what's NOT bundled. |

`get_scoring_rules` is unaffected — the same text is already in this skill file (Section 3 — Scoring rules). `get_user_points` and `submit_prediction` cannot be reasonably faked offline; if the user asks for either while the live endpoint is down, surface that and stop rather than fabricating data.
