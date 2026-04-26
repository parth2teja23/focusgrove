# FocusGrove - Developer Reference

Quick reference guide for developers working on FocusGrove.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  Pages → Components → Hooks → Server Actions → Supabase │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│            Backend (Supabase PostgreSQL)                │
│         Auth + Profiles + Tasks + RLS Policies          │
└─────────────────────────────────────────────────────────┘
```

## File Organization

### Pages (User-facing routes)
- `app/page.tsx` - Root redirects to `/app/today`
- `app/auth/login/page.tsx` - Login page
- `app/auth/sign-up/page.tsx` - Signup page
- `app/app/today/page.tsx` - Main task management view
- `app/app/calendar/page.tsx` - Calendar view with completion dots
- `app/app/forest/page.tsx` - Completed tasks forest visualization
- `app/app/stats/page.tsx` - XP, streak, charts

### Components (Reusable UI)
- `TaskCard.tsx` - Individual task display with timer
- `TaskModal.tsx` - Bottom sheet for task details
- `AddTaskForm.tsx` - Form to add new tasks
- `DateStrip.tsx` - Horizontal date picker
- `ForestView.tsx` - Tree grid for completed tasks
- `ProgressRing.tsx` - SVG progress indicator
- `TimerBar.tsx` - Progress bar for timer
- `BottomNav.tsx` - Navigation bar

### Hooks (React state logic)
- `useTimer.ts` - Countdown timer with pause/resume
- `useTasks.ts` - Fetch tasks with real-time subscription
- `useProfile.ts` - Fetch user profile with real-time updates

### Server Actions (Backend mutations)
- `lib/actions/tasks.ts` - addTask, markTaskDone, deleteTask, updateTaskTimer
- `lib/actions/carryover.ts` - carryOverIncompleteTasks

### Utilities
- `lib/utils.ts` - dateToKey, formatTime, calcXP, calcLevel, getTreeEmoji, etc.
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Auth session middleware

### Types
- `types/index.ts` - Task, Profile, TimerState interfaces

## Common Tasks

### Add a New Feature

1. **Define types** in `types/index.ts`
2. **Create server action** in `lib/actions/` if it modifies data
3. **Create hook** in `hooks/` if it needs to fetch/sync data
4. **Build component** in `components/` for UI
5. **Use in page** or another component

Example: Add task priority
```ts
// 1. Update type
export interface Task {
  // ... existing fields
  priority: 'low' | 'medium' | 'high';
}

// 2. Create action (if needed)
// lib/actions/tasks.ts
export async function updateTaskPriority(taskId: string, priority: string) {
  // Implementation
}

// 3. Use in component
// components/TaskCard.tsx
<div className={`priority-${task.priority}`}>
```

### Add a New Page

1. Create `app/app/newpage/page.tsx`
2. Add to bottom nav in `components/BottomNav.tsx`
3. Follow layout pattern from other pages

### Connect to Supabase Realtime

```ts
// In a hook
const subscription = supabase
  .from('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
    filter: `user_id=eq.${user.id}`,
  }, (payload) => {
    // Handle change
    refetch();
  })
  .subscribe();

return () => subscription.unsubscribe();
```

## Database Queries

### Fetch user tasks for a date
```ts
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .eq('date', '2024-01-15')
  .order('created_at');
```

### Mark task as done and update XP
```ts
// Update task
await supabase
  .from('tasks')
  .update({ done: true })
  .eq('id', taskId);

// Update profile
await supabase
  .from('profiles')
  .update({ xp: newXP, streak: newStreak })
  .eq('id', userId);
```

### Get completed tasks (for forest)
```ts
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .eq('done', true)
  .order('created_at', { ascending: false });
```

## Testing

### Test Timer
1. Add task with 1 minute duration
2. Open task modal
3. Click "Start Timer"
4. Verify countdown works
5. Test pause/resume
6. Wait for auto-completion

### Test Carry-Over
1. Add task for yesterday with short duration
2. Don't complete it
3. Go to today
4. Refresh page
5. Should see 📌 badge on carried task

### Test Real-time
1. Open app in two browser windows
2. Complete task in window 1
3. Watch window 2 update automatically

## Performance Tips

- Use real-time subscriptions sparingly
- Batch updates when possible
- Use `revalidatePath` to update cache
- Optimize images and assets
- Test on slow 3G network (DevTools)

## Styling

### Color Palette
- **Primary (Green)**: `#22c55e` / `var(--primary)`
- **Accent (Amber)**: `#f59e0b` / `var(--accent)` (carried tasks)
- **Info (Blue)**: `#3b82f6` (timers)
- **Text**: `#1f2937` (gray-900)
- **Borders**: `#e5e7eb` (gray-200)

### Responsive Design
- Max width: 500px (mobile-first)
- Bottom nav: 60px fixed height
- Padding: 16px (p-4)
- Gaps: 12px (gap-3)

## Keyboard Shortcuts

Can add to pages:
- `Enter` - Submit form
- `Esc` - Close modal
- `Ctrl+K` - Quick search (future)

## Error Handling

### Network Errors
```ts
try {
  // Call server action
} catch (err) {
  setError(String(err));
}
```

### Auth Errors
```ts
const { error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (signInError) {
  setError(signInError.message);
}
```

## Debugging

### Check RLS Policies
- Go to Supabase Dashboard
- Auth → Policies tab
- Verify policies match user IDs

### Monitor Database
- SQL Editor → Run custom query
- Check `_prisma_migrations` if using migrations
- View real-time data in Table Editor

### Debug Client-side
- Open DevTools (F12)
- Check Network tab for API calls
- Check Console for errors
- Check Application → Cookies for auth session

## Deployment Checklist

- [ ] All env variables set in Vercel
- [ ] Database schema created in Supabase
- [ ] RLS policies enabled
- [ ] Auth trigger for profile creation works
- [ ] Test signup flow
- [ ] Test task creation
- [ ] Test timer functionality
- [ ] Test real-time updates
- [ ] Check performance on mobile network

## Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Tailwind CSS](https://tailwindcss.com)
- [React Server Components](https://react.dev/reference/rsc/server-components)

---

Happy coding! 🚀
