# FocusGrove Setup Guide

Complete setup instructions for the FocusGrove study tracker application.

## Prerequisites

- Node.js 18+ (download from [nodejs.org](https://nodejs.org))
- npm or yarn package manager
- Git
- A Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd studyBuddy

# Install dependencies
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: focusgrove (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
4. Wait for project to initialize (2-3 minutes)

## Step 3: Set Up Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (executes SQL)
6. Verify tables were created by checking the **Table Editor**

You should see:
- `profiles` table
- `tasks` table
- Both with RLS enabled

## Step 4: Get API Credentials

1. Go to **Settings** → **API** in your Supabase project
2. Find the "Project URL" and "anon public" API key
3. Copy both values

## Step 5: Configure Environment Variables

1. In the project root, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your_project_url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your_anon_key>
```

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

## Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the FocusGrove login page.

## Step 7: Create Your Account

1. Click "Create Account" on the login page
2. Enter email and password
3. Click "Create Account"
4. You'll be redirected to the Today page
5. Your profile is automatically created in the database

## Step 8: Enable Google Sign-In (Supabase)

1. In Supabase Dashboard, open Authentication -> Providers -> Google
2. Enable Google provider
3. Create OAuth credentials in Google Cloud and copy Client ID / Client Secret into Supabase
4. Add this redirect URL in Google Cloud OAuth settings:
   - http://localhost:3000/auth/callback
5. For production, add your production callback URL too:
   - https://your-domain.com/auth/callback
6. Save changes in Supabase provider settings

## Verification Checklist

- [ ] Dependencies installed without errors
- [ ] Supabase project created and schema applied
- [ ] Environment variables set in `.env.local`
- [ ] Dev server runs without errors
- [ ] Can create account and login
- [ ] Can see Today page with empty tasks
- [ ] Can add a new task
- [ ] Can mark task as done (should show confetti)

## Troubleshooting

### "Cannot find module @supabase/ssr"
```bash
npm install @supabase/ssr@latest
```

### "API key is invalid or revoked"
- Check `.env.local` has correct credentials
- Verify project URL and key from Supabase dashboard
- Make sure env variables are wrapped correctly without quotes

### Database connection fails
- Verify Supabase project is running (check project dashboard)
- Check internet connection
- Try refreshing the page

### "Could not find the table 'public.tasks' in the schema cache"
This means your Supabase API cannot see the `public.tasks` table yet.

1. Open Supabase -> SQL Editor and run the full schema from `supabase/schema.sql`
2. Then run this command to refresh PostgREST schema cache:

```sql
NOTIFY pgrst, 'reload schema';
```

3. Verify table exists:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public' and table_name = 'tasks';
```

4. In Supabase -> API settings, ensure `public` is included in exposed schemas
5. Refresh the app and try creating a task again

### "insert or update on table \"tasks\" violates foreign key constraint \"tasks_user_id_fkey\""
This means the logged-in user exists in `auth.users` but does not yet have a matching row in `public.profiles`.

Run this backfill query in Supabase SQL Editor:

```sql
insert into public.profiles (id)
select u.id
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

notify pgrst, 'reload schema';
```

Then sign out/in and retry creating the task.

### "User not authenticated"
- Clear browser cookies/cache
- Sign out and sign back in
- Check RLS policies are enabled in Supabase

### Timer doesn't work
- Check browser console for errors (F12)
- Verify `duration_minutes` is set when creating task
- Make sure JavaScript is enabled

## Development Tips

### Hot Reload
Changes to files automatically reload in the browser.

### Database Debugging
- Go to Supabase Dashboard → Table Editor
- View live data in tables
- Check logs in Functions → Monitor

### Real-time Updates
Test across multiple tabs:
1. Open app in two tabs
2. Complete a task in Tab 1
3. Tab 2 should update automatically

## Deployment to Vercel

1. Push project to GitHub:
```bash
git add .
git commit -m "Deploy FocusGrove"
git push
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Click "Deploy"

Your app will be live at a Vercel URL!

## Next Steps

- Customize colors and theme in `tailwind.config.ts`
- Add more task categories
- Set up daily notifications (future feature)
- Track achievements (future feature)

## Support

For issues:
1. Check error messages in browser console (F12)
2. Verify all environment variables are set
3. Check Supabase project status
4. Review application logs in Supabase dashboard

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hooks](https://react.dev/reference/react/hooks)

Happy studying! 🌱
