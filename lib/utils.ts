import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isTomorrow, differenceInCalendarDays } from "date-fns";

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a date string (YYYY-MM-DD) to a sortable key
 */
export function dateToKey(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  return format(date, "yyyy-MM-dd");
}

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculate XP for a completed task
 * - If duration: ceil(duration / 5) * 10
 * - If no timer: 20 XP
 */
export function calcXP(durationMinutes: number | null): number {
  if (!durationMinutes) {
    return 20;
  }
  return Math.ceil(durationMinutes / 5) * 10;
}

/**
 * Calculate user level from XP
 */
export function calcLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/**
 * Get a human-readable date label
 */
export function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  if (isTomorrow(date)) {
    return "Tomorrow";
  }
  const daysAgo = differenceInCalendarDays(new Date(), date);
  if (daysAgo > 0 && daysAgo < 7) {
    return `${daysAgo}d ago`;
  }
  return format(date, "MMM d");
}

/**
 * Get tree emoji based on task duration
 * - No timer: 🌱 (seed)
 * - ≤ 15 min: 🌿 (herb)
 * - ≤ 30 min: 🌳 (tree)
 * - ≤ 45 min: 🎋 (bamboo)
 * - > 45 min: 🌲 (pine tree)
 */
export function getTreeEmoji(durationMinutes: number | null): string {
  if (!durationMinutes) return "🌱";
  if (durationMinutes <= 15) return "🌿";
  if (durationMinutes <= 30) return "🌳";
  if (durationMinutes <= 45) return "🎋";
  return "🌲";
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return dateToKey(date1) === dateToKey(date2);
}

/**
 * Get dates for the date strip (3 past, today, 3 future)
 */
export function getDateRangeForStrip(centerDate: string): string[] {
  const center = new Date(centerDate + "T00:00:00");
  const dates: string[] = [];
  
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(dateToKey(d));
  }
  
  return dates;
}
