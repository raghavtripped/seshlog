-- Poker session analytics: tables, RLS, and stats view.
-- All tables are prefixed `poker_` to avoid colliding with the existing
-- substance-tracking `public.sessions` table. user_id is uuid (FK -> auth.users).

-- ── poker_profiles ───────────────────────────────────────────────
create table public.poker_profiles (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  base_currency    text not null default 'INR',
  default_currency text not null default 'INR',
  timezone         text not null default 'Asia/Kolkata',
  created_at       timestamptz not null default now()
);

-- ── poker_presets ────────────────────────────────────────────────
create table public.poker_presets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  label         text not null,
  venue         text,
  session_type  text,
  currency      text,
  small_blind   numeric,
  big_blind     numeric,
  ante          numeric,
  straddle      numeric,
  default_buyin numeric,
  max_buyin     numeric,
  game_type     text,
  created_at    timestamptz not null default now()
);

-- ── poker_sessions ───────────────────────────────────────────────
create table public.poker_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  venue           text,
  session_type    text,
  game_type       text,
  currency        text not null,
  fx_rate_to_base numeric not null default 1,
  small_blind     numeric not null,
  big_blind       numeric not null,
  ante            numeric,
  straddle        numeric,
  max_buyin       numeric,
  cash_out        numeric,
  est_hands       integer,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  mood            smallint,
  focus           smallint,
  sleep_hours     numeric,
  tilt            boolean,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ── poker_buy_ins ────────────────────────────────────────────────
create table public.poker_buy_ins (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.poker_sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric not null,
  kind       text not null default 'initial',  -- initial | rebuy | topup | addon
  note       text,
  created_at timestamptz not null default now()
);

-- ── poker_key_hands ──────────────────────────────────────────────
create table public.poker_key_hands (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.poker_sessions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  hole_cards    text,
  board         text,
  position      text,
  pot_size      numeric,
  result_amount numeric,
  tag           text,  -- bluff | value | cooler | mistake | fold | other
  note          text,
  created_at    timestamptz not null default now()
);

-- ── indexes ──────────────────────────────────────────────────────
create index poker_sessions_user_started_idx on public.poker_sessions (user_id, started_at desc);
create index poker_buy_ins_session_idx       on public.poker_buy_ins (session_id);
create index poker_key_hands_session_idx     on public.poker_key_hands (session_id);
create index poker_presets_user_idx          on public.poker_presets (user_id);

-- ── RLS: enable + own-row policies on every table ────────────────
alter table public.poker_profiles  enable row level security;
alter table public.poker_presets   enable row level security;
alter table public.poker_sessions  enable row level security;
alter table public.poker_buy_ins   enable row level security;
alter table public.poker_key_hands enable row level security;

create policy "poker_profiles_select_own" on public.poker_profiles for select using (user_id = auth.uid());
create policy "poker_profiles_insert_own" on public.poker_profiles for insert with check (user_id = auth.uid());
create policy "poker_profiles_update_own" on public.poker_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "poker_profiles_delete_own" on public.poker_profiles for delete using (user_id = auth.uid());

create policy "poker_presets_select_own" on public.poker_presets for select using (user_id = auth.uid());
create policy "poker_presets_insert_own" on public.poker_presets for insert with check (user_id = auth.uid());
create policy "poker_presets_update_own" on public.poker_presets for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "poker_presets_delete_own" on public.poker_presets for delete using (user_id = auth.uid());

create policy "poker_sessions_select_own" on public.poker_sessions for select using (user_id = auth.uid());
create policy "poker_sessions_insert_own" on public.poker_sessions for insert with check (user_id = auth.uid());
create policy "poker_sessions_update_own" on public.poker_sessions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "poker_sessions_delete_own" on public.poker_sessions for delete using (user_id = auth.uid());

create policy "poker_buy_ins_select_own" on public.poker_buy_ins for select using (user_id = auth.uid());
create policy "poker_buy_ins_insert_own" on public.poker_buy_ins for insert with check (user_id = auth.uid());
create policy "poker_buy_ins_update_own" on public.poker_buy_ins for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "poker_buy_ins_delete_own" on public.poker_buy_ins for delete using (user_id = auth.uid());

create policy "poker_key_hands_select_own" on public.poker_key_hands for select using (user_id = auth.uid());
create policy "poker_key_hands_insert_own" on public.poker_key_hands for insert with check (user_id = auth.uid());
create policy "poker_key_hands_update_own" on public.poker_key_hands for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "poker_key_hands_delete_own" on public.poker_key_hands for delete using (user_id = auth.uid());

-- ── stats view (RLS of underlying tables applies via security_invoker) ──
create view public.poker_sessions_with_stats
with (security_invoker = true) as
select
  s.*,
  coalesce(b.total_buyin_native, 0)                                    as total_buyin_native,
  s.cash_out - coalesce(b.total_buyin_native, 0)                       as net_native,
  (s.cash_out - coalesce(b.total_buyin_native, 0)) * s.fx_rate_to_base as net_base,
  extract(epoch from (s.ended_at - s.started_at)) / 60                 as duration_minutes,
  case when s.big_blind > 0
       then (s.cash_out - coalesce(b.total_buyin_native, 0)) / s.big_blind
  end                                                                  as bb_won
from public.poker_sessions s
left join (
  select session_id, sum(amount) as total_buyin_native
  from public.poker_buy_ins
  group by session_id
) b on b.session_id = s.id;
