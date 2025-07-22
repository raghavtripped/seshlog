-- Create user_insights table
create table if not exists public.user_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  insight_text text not null,
  generated_at timestamptz not null default now(),
  priority integer not null default 1
);

-- Enable RLS
alter table public.user_insights enable row level security;

-- RLS Policy: Only allow users to access their own insights
create policy "Users can view their own insights"
  on public.user_insights
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own insights"
  on public.user_insights
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own insights"
  on public.user_insights
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own insights"
  on public.user_insights
  for delete
  using (auth.uid() = user_id);

-- Create function to create table if called from edge function
create or replace function create_user_insights_table()
returns void
language sql
as $$
  -- This function exists for the edge function compatibility
  -- Table creation is handled by migration
$$; 