# FocusGrove 🌱

<div align="center">

**Plant trees by completing your study tasks. Grow your focus forest!**

A modern, full-stack study tracker app built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Setup Guide](./SETUP.md) • [Developer Guide](./DEVELOPER.md)

</div>

## Features

### Core Features
- 📋 **Daily Task Management** - Add, edit, and track your study tasks
- ⏲️ **Built-in Pomodoro Timer** - Focus sessions with pause/resume functionality
- 🌱 **Forest Visualization** - Plant trees for each completed task
- 📊 **Statistics Dashboard** - Track XP, streaks, and weekly progress
- 📅 **Calendar View** - See your completion history at a glance
- 🔥 **Streak System** - Build momentum with consecutive day challenges
- 📌 **Auto Carry-Over** - Incomplete tasks automatically carry to next day
- 🎉 **Confetti Celebrations** - Get rewarded for completing tasks

### Technical Highlights
- Real-time synchronization across browser tabs
- Responsive mobile-first design (max 500px width)
- Server-side authentication with secure RLS policies
- Automatic profile creation on signup
- Streak and XP system with level progression

## Tech Stack

<table>
<tr>
  <td><strong>Frontend</strong></td>
  <td>Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS</td>
</tr>
<tr>
  <td><strong>Backend</strong></td>
  <td>Supabase (PostgreSQL, Auth, Real-time)</td>
</tr>
<tr>
  <td><strong>Styling</strong></td>
  <td>Tailwind CSS, Nunito Font, Canvas Confetti</td>
</tr>
<tr>
  <td><strong>Charts</strong></td>
  <td>Recharts (for weekly statistics)</td>
</tr>
<tr>
  <td><strong>Deployment</strong></td>
  <td>Vercel (Frontend), Supabase Cloud (Backend)</td>
</tr>
</table>

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd studyBuddy
npm install
```

### 2. Set Up Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL from `supabase/schema.sql` in SQL Editor
4. Copy API credentials to `.env.local`

### 3. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account!

👉 **Detailed setup instructions in [SETUP.md](./SETUP.md)**

## Project Structure

```
├── app/
│   ├── page.tsx                    # Root → redirects to /app/today
│   ├── layout.tsx                  # Global layout (Nunito font)
│   ├── auth/                       # Auth pages (login, signup)
│   └── app/                        # Protected routes
│       ├── today/page.tsx          # Daily task view
│       ├── calendar/page.tsx       # Monthly calendar
│       ├── forest/page.tsx         # Forest visualization
│       └── stats/page.tsx          # Statistics & charts
│
├── components/
│   ├── TaskCard.tsx                # Task display with timer
│   ├── TaskModal.tsx               # Task details modal
│   ├── AddTaskForm.tsx             # Add task form
│   ├── DateStrip.tsx               # Date picker
│   ├── ForestView.tsx              # Tree grid
│   ├── ProgressRing.tsx            # Progress indicator
│   ├── TimerBar.tsx                # Timer progress bar
│   ├── BottomNav.tsx               # Navigation bar
│   └── ui/                         # Radix UI components
│
├── lib/
│   ├── utils.ts                    # Utility functions
│   ├── actions/                    # Server actions
│   │   ├── tasks.ts                # Task mutations
│   │   └── carryover.ts            # Carry-over logic
│   └── supabase/                   # Supabase clients
│
├── hooks/
│   ├── useTimer.ts                 # Timer state management
│   ├── useTasks.ts                 # Tasks with real-time
│   └── useProfile.ts               # Profile + XP
│
├── types/
│   └── index.ts                    # TypeScript interfaces
│
└── supabase/
    └── schema.sql                  # Database schema
```

## Key Features Explained

### 🎯 Task Management
- Add tasks with optional duration (or no timer)
- Mark complete, delete, or pause timer
- Tasks carry over automatically if incomplete

### ⏲️ Timer System
- Pause and resume anytime
- Auto-marks task complete when timer ends
- Progress bar shows remaining time

### 🌱 Forest & XP
- **XP Formula**: `Math.ceil(duration / 5) * 10` (20 XP for no-timer)
- **Trees**: Grow with task duration (🌱🌿🌳🌲)
- **Levels**: Every 100 XP = 1 level

### 📊 Streaks
- Increment for each day with completed tasks
- Reset if you miss a day
- Visualized in stats dashboard

### 📅 Calendar
- See completion percentage per day
- Green = all tasks done, Yellow = some done
- Celebration emoji for perfect days

## Deployment

### Deploy to Vercel (Recommended)
```bash
git add .
git commit -m "Deploy FocusGrove"
git push
```
Then connect repo to [Vercel](https://vercel.com) and set environment variables.

### Production Checklist
- [ ] Environment variables set in Vercel
- [ ] Supabase RLS policies enabled
- [ ] Test signup flow
- [ ] Test real-time updates
- [ ] Verify timer functionality
- [ ] Check mobile responsiveness

## Database Schema

### profiles
- `id` (UUID, PK) - User ID from auth
- `username` (text)
- `xp` (integer) - Total experience points
- `streak` (integer) - Current streak
- `last_active_date` (date)
- `created_at` (timestamp)

### tasks
- `id` (UUID, PK)
- `user_id` (UUID, FK) - Profile reference
- `name` (text)
- `duration_minutes` (integer, nullable)
- `date` (date)
- `done` (boolean)
- `carried_from` (UUID, nullable) - Original task ID if carried over
- `timer_left_seconds` (integer, nullable)
- `created_at` (timestamp)

All tables have RLS enabled. See `supabase/schema.sql` for full setup.

## Styling & Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Tasks) | Green | #22c55e |
| Carried Over | Amber | #f59e0b |
| Timer Active | Blue | #3b82f6 |
| Text | Gray | #1f2937 |
| Borders | Light Gray | #e5e7eb |

**Font**: Nunito (400, 600, 700, 800, 900)

## Tips for Use

1. **Build Streaks**: Complete at least 1 task every day to maintain momentum
2. **Use Timers**: Set durations to get more XP and grow better trees
3. **Check Calendar**: Review your completion history to spot patterns
4. **Carry Over**: Let tasks remind you of unfinished work from yesterday
5. **Celebrate**: Each completion gives you XP and grows your forest

## Contributing

Found a bug? Want to add a feature?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run dev
```

### Database connection fails
- Check Supabase project is running
- Verify environment variables in `.env.local`
- Check RLS policies are enabled

### Timer not working
- Verify `duration_minutes` is set when creating task
- Check browser console (F12) for errors
- Try refreshing the page

### Real-time updates not working
- Check internet connection
- Verify Supabase real-time is enabled
- Try hard refresh (Ctrl+Shift+R)

📖 **Full troubleshooting in [SETUP.md](./SETUP.md)**

## Learning Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Guide](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hooks](https://react.dev/reference/react/hooks)

## Future Roadmap

- [ ] Dark mode
- [ ] Task categories and tags
- [ ] Collaborative study sessions
- [ ] Achievement badges system
- [ ] Export statistics
- [ ] Weekly goal setting
- [ ] Focus music integration
- [ ] Mobile app (React Native)

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

<div align="center">

Made with 💚 by developers for students and professionals everywhere.

**Plant a tree. Build a forest. Master your focus.** 🌱🌲

</div>
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
  ```
  > [!NOTE]
  > This example uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which refers to Supabase's new **publishable** key format.
  > Both legacy **anon** keys and new **publishable** keys can be used with this variable name during the transition period. Supabase's dashboard may show `NEXT_PUBLIC_SUPABASE_ANON_KEY`; its value can be used in this example.
  > See the [full announcement](https://github.com/orgs/supabase/discussions/29260) for more information.

  Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
#   f o c u s g r o v e 
 
 