# FocusGrove - Study Tracker App

Plant trees by completing your study tasks. Grow your focus forest!

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Nunito Font
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Animations**: Canvas Confetti, Tailwind CSS animations
- **Deployment**: Vercel (Frontend) + Supabase Cloud

## Features

### Core Features
- 🎯 **Daily Task Management**: Add tasks with optional duration timers
- ⏲️ **Pomodoro-style Timers**: Track focus time with pause/resume
- 🌱 **Forest Visualization**: Plant trees for each completed task
- 📊 **Statistics Dashboard**: Track XP, streaks, and weekly progress
- 📅 **Calendar View**: See completion history with visual indicators
- 🔥 **Streak System**: Build daily momentum with consecutive day challenges
- 📌 **Carry-Over Tasks**: Incomplete tasks automatically carry over to next day

### XP & Level System
- **XP Calculation**: `Math.ceil(duration / 5) * 10` per task (20 XP for no-timer tasks)
- **Levels**: `Math.floor(xp / 100) + 1`
- **Trees**: Task trees scale with duration (seed 🌱 → tree 🌲)

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings → API.

### 2. Supabase Schema Setup

Execute the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  xp integer default 0,
  streak integer default 0,
  last_active_date date,
  created_at timestamptz default now()
);

-- Create tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  duration_minutes integer,
  date date not null,
  done boolean default false,
  carried_from uuid references tasks(id),
  timer_left_seconds integer,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table tasks enable row level security;

-- RLS Policies
create policy "Users can manage own profile"
  on profiles for all
  using (auth.uid() = id);

create policy "Users can manage own tasks"
  on tasks for all
  using (auth.uid() = user_id);

-- Create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── page.tsx                    # Root redirect to /app/today
├── layout.tsx                  # Global layout (Nunito font)
├── auth/
│   ├── login/page.tsx          # Login page
│   └── sign-up/page.tsx        # Signup page
└── app/                        # Protected routes
    ├── layout.tsx              # App layout with auth guard + bottom nav
    ├── today/page.tsx          # Main daily task view
    ├── calendar/page.tsx       # Monthly calendar
    ├── forest/page.tsx         # Completed tasks forest
    └── stats/page.tsx          # XP, streak, charts

components/
├── TaskCard.tsx                # Individual task with timer
├── AddTaskForm.tsx             # Add task modal
├── TaskModal.tsx               # Task detail modal
├── DateStrip.tsx               # Date picker strip
├── ForestView.tsx              # Tree grid
├── ProgressRing.tsx            # SVG progress indicator
├── TimerBar.tsx                # Timer progress bar
├── BottomNav.tsx               # Navigation tabs
└── ui/                         # Radix UI components

lib/
├── utils.ts                    # Utilities (dateToKey, formatTime, calcXP, etc.)
├── actions/
│   ├── tasks.ts                # Server actions (add, mark done, delete)
│   └── carryover.ts            # Carry-over logic
└── supabase/
    ├── client.ts               # Browser client
    └── server.ts               # Server client

hooks/
├── useTimer.ts                 # Countdown timer logic
├── useTasks.ts                 # Fetch tasks with real-time sub
└── useProfile.ts               # User profile + XP

types/
└── index.ts                    # TypeScript interfaces
```

## Key Implementation Details

### Timer Management
- Client-side only countdown with `setInterval`
- Pause/resume functionality
- Syncs `timer_left_seconds` to DB on pause
- Auto-marks task as done when timer reaches 0

### Carry-Over Logic
- Runs on app load and date change
- Idempotent (safe to call multiple times)
- Checks for existing carry-over before inserting
- Maintains original task reference via `carried_from`

### Real-Time Updates
- All pages use Supabase real-time subscriptions
- Instant sync across browser tabs
- Updates trigger automatic refetch

### Styling
- Mobile-first design (max-width: 500px)
- Green (#22c55e) as primary color
- Amber (#f59e0b) for carried-over tasks
- Blue (#3b82f6) for active timers
- Nunito font family (400-900 weights)
- Bottom nav: 60px fixed height

## Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Supabase (Database)
1. Create account at supabase.com
2. Create new project
3. Run schema SQL
4. Copy API credentials to environment variables

## Future Enhancements

- [ ] Dark mode support
- [ ] Task categories/tags
- [ ] Collaborative study sessions
- [ ] Achievement badges
- [ ] Export statistics
- [ ] Weekly goals setting
- [ ] Focus music integration
- [ ] Notifications for streaks

## License

MIT
