-- =====================================================================
-- LUNARIA V5 — complete schema (V1–V5 cumulative)
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to run more than once: it only CREATES what is missing and never
-- drops or deletes existing data.
-- =====================================================================

-- ---------- Profiles, PIN hash, theme & widget preferences ----------
create table if not exists public.lunaria_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_path text,
  background_path text,
  pin_hash text,
  pin_salt text,
  theme jsonb not null default '{}'::jsonb,
  widgets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tasks (small + long projects) ----------
create table if not exists public.lunaria_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  created_at timestamptz not null default now()
);
-- Columns added cumulatively (works with older V2/V3 tables too)
alter table public.lunaria_tasks add column if not exists task_type text not null default 'small';
alter table public.lunaria_tasks add column if not exists label text not null default '';
alter table public.lunaria_tasks add column if not exists assigned_by text not null default '';
alter table public.lunaria_tasks add column if not exists description text not null default '';
alter table public.lunaria_tasks add column if not exists deadline date;
alter table public.lunaria_tasks add column if not exists status text not null default 'active';
alter table public.lunaria_tasks add column if not exists progress integer not null default 0;
alter table public.lunaria_tasks add column if not exists completed_at timestamptz;
alter table public.lunaria_tasks add column if not exists updated_at timestamptz not null default now();
do $$ begin
  alter table public.lunaria_tasks add constraint lunaria_tasks_type_chk check (task_type in ('small','long'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.lunaria_tasks add constraint lunaria_tasks_status_chk check (status in ('active','completed','failed'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.lunaria_tasks add constraint lunaria_tasks_progress_chk check (progress between 0 and 100);
exception when duplicate_object then null; end $$;
create index if not exists lunaria_tasks_user_idx on public.lunaria_tasks(user_id, created_at desc);

create table if not exists public.lunaria_task_progress (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.lunaria_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  description text not null default '',
  progress integer not null check (progress between 0 and 100),
  created_at timestamptz not null default now()
);
create index if not exists lunaria_task_progress_task_idx on public.lunaria_task_progress(task_id, entry_date);

-- ---------- Diary (manual entries) + automatic activity log ----------
create table if not exists public.lunaria_diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'A little entry',
  body text not null default '',
  mood text not null default '',
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lunaria_diary_user_idx on public.lunaria_diary_entries(user_id, entry_date desc);

create table if not exists public.lunaria_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  source_key text not null,
  title text not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, source_key)   -- prevents duplicate activity logs
);
create index if not exists lunaria_activity_user_idx on public.lunaria_activity(user_id, created_at desc);

-- ---------- Habits ----------
create table if not exists public.lunaria_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🌱',
  frequency text not null default 'daily' check (frequency in ('daily','weekly','monthly')),
  detail text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.lunaria_habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.lunaria_habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  period_key text not null,
  created_at timestamptz not null default now(),
  unique (habit_id, period_key)
);
create index if not exists lunaria_checkins_user_idx on public.lunaria_habit_checkins(user_id, created_at desc);

-- ---------- Journey (emotional check-ins) ----------
create table if not exists public.lunaria_journey (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feeling text not null,
  emoji text not null default '✨',
  intensity integer not null default 3 check (intensity between 1 and 5),
  reflection text not null default '',
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists lunaria_journey_user_idx on public.lunaria_journey(user_id, entry_date desc);

-- ---------- Media library ----------
create table if not exists public.lunaria_media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'Other',
  file_path text not null unique,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);
alter table public.lunaria_media_items add column if not exists description text not null default '';
create index if not exists lunaria_media_user_idx on public.lunaria_media_items(user_id, created_at desc);

-- ---------- Memories ----------
create table if not exists public.lunaria_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  memory_date date not null default current_date,
  caption text not null default '',
  storage_path text,
  created_at timestamptz not null default now()
);
alter table public.lunaria_memories add column if not exists media_id uuid references public.lunaria_media_items(id) on delete set null;
alter table public.lunaria_memories alter column storage_path drop not null;
create index if not exists lunaria_memories_user_idx on public.lunaria_memories(user_id, memory_date desc);

-- ---------- Recipes & collections ----------
create table if not exists public.lunaria_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  ingredients text not null default '',
  steps text not null default '',
  created_at timestamptz not null default now()
);
alter table public.lunaria_recipes add column if not exists image_path text;
create index if not exists lunaria_recipes_user_idx on public.lunaria_recipes(user_id, created_at desc);

create table if not exists public.lunaria_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'General',
  description text not null default '',
  image_path text,
  media_id uuid references public.lunaria_media_items(id) on delete set null,
  rating integer not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now()
);
create index if not exists lunaria_collections_user_idx on public.lunaria_collections(user_id, created_at desc);

-- ---------- Calendar ----------
create table if not exists public.lunaria_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  event_date date not null,
  details text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lunaria_calendar_events add column if not exists start_time time;
alter table public.lunaria_calendar_events add column if not exists task_id uuid references public.lunaria_tasks(id) on delete set null;
create index if not exists lunaria_events_user_idx on public.lunaria_calendar_events(user_id, event_date);

-- ---------- Knowledge Garden ----------
create table if not exists public.lunaria_knowledge_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  body text not null default '',
  category text not null default 'General',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lunaria_knowledge_cards add column if not exists links text[] not null default '{}';
alter table public.lunaria_knowledge_cards add column if not exists related_ids uuid[] not null default '{}';
alter table public.lunaria_knowledge_cards add column if not exists task_id uuid references public.lunaria_tasks(id) on delete set null;
create index if not exists lunaria_knowledge_user_idx on public.lunaria_knowledge_cards(user_id, updated_at desc);

-- ---------- Arcade scores ----------
create table if not exists public.lunaria_game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game text not null,
  difficulty text not null default 'normal',
  score integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists lunaria_scores_user_idx on public.lunaria_game_scores(user_id, game, score desc);

-- ---------- Grants + Row Level Security (owner-only) ----------
do $$
declare t text;
begin
  foreach t in array array[
    'lunaria_profiles','lunaria_tasks','lunaria_task_progress','lunaria_diary_entries',
    'lunaria_activity','lunaria_habits','lunaria_habit_checkins','lunaria_journey',
    'lunaria_media_items','lunaria_memories','lunaria_recipes','lunaria_collections',
    'lunaria_calendar_events','lunaria_knowledge_cards','lunaria_game_scores'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "lunaria owner access" on public.%I', t);
    execute format('create policy "lunaria owner access" on public.%I for all to authenticated
                    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- ---------- Private storage bucket (user folder = auth.uid()) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('lunaria-private', 'lunaria-private', false, 52428800)
on conflict (id) do update set public = false;

drop policy if exists "lunaria read own files" on storage.objects;
create policy "lunaria read own files" on storage.objects for select to authenticated
  using (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "lunaria upload own files" on storage.objects;
create policy "lunaria upload own files" on storage.objects for insert to authenticated
  with check (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "lunaria update own files" on storage.objects;
create policy "lunaria update own files" on storage.objects for update to authenticated
  using (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "lunaria delete own files" on storage.objects;
create policy "lunaria delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);

notify pgrst, 'reload schema';
