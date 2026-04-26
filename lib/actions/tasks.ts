"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Task, Profile } from "@/types";
import { calcXP, dateToKey } from "@/lib/utils";

function mapDbError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("could not find the table 'public.tasks' in the schema cache")) {
    return "Database not initialized: missing public.tasks table. Run supabase/schema.sql in Supabase SQL Editor, then run: NOTIFY pgrst, 'reload schema';";
  }

  if (lower.includes("schema cache")) {
    return "Supabase schema cache is stale. Run: NOTIFY pgrst, 'reload schema'; then refresh the app.";
  }

  return message;
}

/**
 * Create a new task for the authenticated user
 */
export async function addTask(
  name: string,
  durationMinutes: number | null,
  date: string
): Promise<Task | { error: string }> {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Not authenticated" };
    }
    
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,
          name,
          duration_minutes: durationMinutes,
          date,
          done: false,
          carried_from: null,
          timer_left_seconds: durationMinutes ? durationMinutes * 60 : null,
        },
      ])
      .select()
      .single();
    
    if (error) {
      return { error: mapDbError(error.message) };
    }
    
    revalidatePath("/app/today");
    return data;
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * Mark a task as done and award XP
 */
export async function markTaskDone(taskId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Not authenticated" };
    }
    
    // Get the task to calculate XP
    const { data: task, error: getError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();
    
    if (getError || !task) {
      return { error: "Task not found" };
    }
    
    // Mark task as done
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ done: true, timer_left_seconds: null })
      .eq("id", taskId);
    
    if (updateError) {
      return { error: mapDbError(updateError.message) };
    }
    
    // Award XP and check streak
    const xpGained = calcXP(task.duration_minutes);
    const today = dateToKey(new Date());
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (!profileError && profile) {
      const lastActive = profile.last_active_date;
      const lastActiveDate = lastActive ? new Date(lastActive + "T00:00:00") : null;
      const todayDate = new Date(today + "T00:00:00");
      
      let newStreak = profile.streak;
      
      // Check if we should increment streak
      if (lastActive === today) {
        // Already active today, keep streak
        newStreak = profile.streak;
      } else if (lastActive) {
        const daysSinceLastActive = Math.floor(
          (todayDate.getTime() - lastActiveDate!.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastActive === 1) {
          // Yesterday, increment streak
          newStreak = profile.streak + 1;
        } else {
          // More than 1 day, reset streak
          newStreak = 1;
        }
      } else {
        // First time, set streak to 1
        newStreak = 1;
      }
      
      await supabase
        .from("profiles")
        .update({
          xp: profile.xp + xpGained,
          streak: newStreak,
          last_active_date: today,
        })
        .eq("id", user.id);
    }
    
    revalidatePath("/app/today");
    revalidatePath("/app/stats");
    revalidatePath("/app/forest");
    
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Not authenticated" };
    }
    
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);
    
    if (error) {
      return { error: mapDbError(error.message) };
    }
    
    revalidatePath("/app/today");
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * Update timer_left_seconds when user pauses timer
 */
export async function updateTaskTimer(
  taskId: string,
  secondsLeft: number
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Not authenticated" };
    }
    
    const { error } = await supabase
      .from("tasks")
      .update({ timer_left_seconds: secondsLeft })
      .eq("id", taskId)
      .eq("user_id", user.id);
    
    if (error) {
      return { error: mapDbError(error.message) };
    }
    
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}
