# Poker Tracker

A cash-game poker session tracker built **inside the seshlog app** as a new
"Poker" category. It shares seshlog's Supabase project, auth, and component
library — it is not a separate app.

- **Design spec:** `poker-tracker/docs/superpowers/specs/2026-06-01-poker-session-analytics-design.md`
- **Entry points:** the **Poker** card on the Categories home screen, the
  **Poker** tab in the mobile bottom nav, or `/poker` directly.

---

## Backend

All poker data lives in the existing Supabase project **`gmbyjqlowntmxpbmaldx`
("sess logger")**. No new project, no new env vars — the app uses the existing
`src/integrations/supabase/client.ts`.

### Schema

Migration: `supabase/migrations/20260601120000_create_poker_tables.sql`

Five tables, all prefixed `poker_` to avoid colliding with seshlog's existing
`public.sessions` table. Every table has `user_id uuid` → `auth.users(id)` and
**Row-Level Security** with own-row policies (`user_id = auth.uid()`) for
select/insert/update/delete.

| Table | Purpose |
|---|---|
| `poker_profiles` | Per-user settings: base currency, default currency, timezone (1 row/user, auto-created on first use). |
| `poker_presets` | Saved stake configs for one-tap logging. |
| `poker_sessions` | One row per cash-game session (stakes, currency, FX rate, cash-out, timing, reflection). |
| `poker_buy_ins` | Buy-ins per session (`initial` / `rebuy` / `topup` / `addon`), cascade-deleted with the session. |
| `poker_key_hands` | Optional notable hands (cards, board, position, pot, result, tag, note). |

### Derived stats view

`poker_sessions_with_stats` (created `with (security_invoker = true)`, so the
caller's RLS applies) exposes the session row plus computed fields:

- `total_buyin_native` — sum of the session's buy-ins
- `net_native` = `cash_out − total_buyin_native`
- `net_base` = `net_native × fx_rate_to_base`
- `duration_minutes` = `ended_at − started_at`
- `bb_won` = `net_native / big_blind`

The client reads this view for lists/dashboards and the base tables for editing.

### Money & currency

- Each session is stored in its **native currency** with an `fx_rate_to_base`
  captured at log time (suggested via a free FX API, always editable).
- Cross-currency totals sum `net_base`, so a USD online session and an INR home
  game roll up correctly into the configured **base currency** (default INR).
- Currency-agnostic skill metrics (BB won, BB/100) need no conversion.

### Regenerating types after schema changes

```bash
supabase gen types typescript --project-id gmbyjqlowntmxpbmaldx > src/integrations/supabase/types.ts
```

(Already done for the current schema.)

---

## Frontend

Vite + React 18 SPA, same stack as the rest of seshlog (react-router, TanStack
Query provider, shadcn/ui, Recharts, sonner, date-fns). No new top-level runtime
dependencies.

### Routes (`src/app/router.tsx`)

| Path | Page | What |
|---|---|---|
| `/poker` | `PokerDashboard` | Headline stats, cumulative profit graph, live-session banner, recent sessions, global filter. |
| `/poker/log` | `PokerLog` | Fast log form with preset picker, live BB equivalent, live-timer vs backfill. |
| `/poker/sessions` | `PokerSessions` | Full filterable session list. |
| `/poker/sessions/:id` | `PokerSessionDetail` | View/edit, end & cash-out, buy-ins, key hands, reflection. |
| `/poker/analytics` | `PokerAnalytics` | Grouped breakdowns, reflection correlation, settings, JSON export. |

All routes are wrapped in the existing `ProtectedRoute`.

### Code layout (`src/features/poker/`)

```
lib/
  types.ts        Domain types (re-exported from generated Supabase types) + enums + filter/stat shapes
  currencies.ts   Currency list + formatMoney / formatBB
  metrics.ts      PURE metric math — net, BB, BB/100, $/hr, ROI, filtering, grouping,
                  cumulative series, reflection buckets. No React, no Supabase.
  metrics.test.ts 24 Vitest unit tests covering the math (the correctness core)
api/              react hooks (plain useState + supabase, matching src/hooks/useSessions.tsx)
  usePokerProfile.ts   settings (auto-creates the profile row)
  usePresets.ts        saved stakes
  usePokerSessions.ts  list (reads the stats view) + create/update/delete; useSession(id) for detail
  useBuyIns.ts         buy-ins per session + running total
  useKeyHands.ts       key hands per session
  fx.ts                fetchSuggestedRate(from, to) with a 1h cache; null on failure
components/
  PokerLayout.tsx       shared header + sub-nav (Dashboard/Log/Sessions/Analytics)
  StatCards.tsx         headline metric cards
  ProfitChart.tsx       recharts cumulative profit (base ↔ BB toggle)
  FilterBar.tsx         date/venue/stake/game/type/currency filter (options derived from data)
  SessionForm.tsx       create (live/backfill + initial buy-in + live BB) AND edit
  PresetPicker.tsx      apply/create/delete presets
  BuyInList.tsx         buy-in timeline editor
  KeyHandList.tsx       notable-hands editor
  ReflectionForm.tsx    mood/focus/sleep/tilt/notes
  LiveSessionBanner.tsx running-timer banner for a live session
  BreakdownTable.tsx    one grouped analytics table
```

Pages live in `src/pages/Poker*.tsx`.

### Metric definitions (single source of truth → `lib/metrics.ts`)

- **Net (base):** `(cash_out − Σ buy-ins) × fx_rate_to_base`
- **BB won:** `net_native / big_blind`
- **BB/100:** `(Σ bb_won / Σ est_hands) × 100` (sessions missing `est_hands` are
  excluded from BB/100 only)
- **Hours:** `Σ duration_minutes / 60`
- **Base/hour:** `net_base / hours`
- **ROI:** `net_native / total_buyin_native` (per session, single currency)
- **Biggest win/loss:** max/min `net_base`

Divide-by-zero cases return `null` and render as `—`.

---

## Running & testing

```bash
npm install          # installs vitest (added as a devDependency)
npm run dev          # start the app, open /poker
npm test             # run the poker metric unit tests (vitest run)
npm run build        # production build
```

### Manual smoke flow

1. Sign in → Categories → **Poker**.
2. **Log** → optionally tap a preset → enter stakes + initial buy-in →
   **Start live timer** → session appears live on the dashboard.
3. Open the session → **+ Re-buy** → fill **Cash out / End** → verify net,
   BB won, duration, BB/100.
4. Add a **key hand** and a **reflection**.
5. **Dashboard**: confirm the session shows on the cumulative profit graph and
   in the headline cards; try the base↔BB toggle and the filter bar.
6. **Analytics**: confirm breakdowns and reflection correlation populate; change
   base currency in Settings; export JSON.

---

## Scope notes (v1)

- Cash games only — no tournaments/ICM, no hand-history import, no live HUD.
- Single user (same account as the rest of seshlog); RLS leaves room for
  multi-user but signup/sharing is not built.
- Data **export** (JSON) is implemented; **import** is deferred (see the design
  spec's "Open Questions").
- Unit tests cover the pure metric core. Component/integration tests are
  described in the spec but not included in this pass.
