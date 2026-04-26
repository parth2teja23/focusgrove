-- FocusGrove - Supabase Database Schema
-- Execute this SQL in your Supabase project

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  xp integer default 0,
  streak integer default 0,
  last_active_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  duration_minutes integer,
  date date not null,
  done boolean default false,
  carried_from uuid references public.tasks(id) on delete set null,
  timer_left_seconds integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- 4. Create RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. Create RLS Policies for tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 6. Create trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create new trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6b. Backfill profiles for users created before trigger existed
insert into public.profiles (id)
select u.id
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 7. Create indexes for better performance
create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_date on public.tasks(date);
create index if not exists idx_tasks_user_date on public.tasks(user_id, date);
create index if not exists idx_tasks_done on public.tasks(done);

-- 8. Add comments for documentation
comment on table public.profiles is 'User profiles with XP and streak tracking';
comment on table public.tasks is 'User tasks with timer and completion tracking';
comment on column public.profiles.xp is 'Total experience points earned';
comment on column public.profiles.streak is 'Current consecutive days with completed tasks';
comment on column public.profiles.last_active_date is 'Last date user completed a task';
comment on column public.tasks.duration_minutes is 'Task duration in minutes (null = no timer)';
comment on column public.tasks.timer_left_seconds is 'Remaining seconds if timer was paused';
comment on column public.tasks.carried_from is 'Reference to original task if carried over from previous day';

-- 9. Refresh PostgREST schema cache after schema changes
notify pgrst, 'reload schema';
