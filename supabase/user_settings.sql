create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal integer not null default 3 check (daily_goal between 1 and 1000),
  accepted_terms_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_settings
add column if not exists accepted_terms_at timestamptz;

alter table public.user_settings enable row level security;

create policy "Users can read their own settings"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own settings"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own settings"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_settings'
  ) then
    alter publication supabase_realtime add table public.user_settings;
  end if;
end $$;
