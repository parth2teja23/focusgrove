"use server";

import { createServerClient } from "@/lib/supabase/server";
import { dateToKey } from "@/lib/utils";

/**
 * Carry over incomplete tasks from previous days to today
 * Safe to call multiple times (idempotent)
 */
export async function carryOverIncompleteTasks(userId: string, todayDate: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient();
    
    // Get all incomplete tasks from before today
    const { data: incompleteTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("done", false)
      .lt("date", todayDate);
    
    if (fetchError) {
      return { error: fetchError.message };
    }
    
    if (!incompleteTasks || incompleteTasks.length === 0) {
      return {};
    }
    
    // For each incomplete task, check if a carry-over already exists for today
    for (const task of incompleteTasks) {
      const { data: existing } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", userId)
        .eq("date", todayDate)
        .eq("carried_from", task.id)
        .single();
      
      // If no carry-over exists yet, create one
      if (!existing) {
        await supabase
          .from("tasks")
          .insert([
            {
              user_id: userId,
              name: task.name,
              duration_minutes: task.duration_minutes,
              date: todayDate,
              done: false,
              carried_from: task.id,
              timer_left_seconds: task.duration_minutes ? task.duration_minutes * 60 : null,
            },
          ]);
      }
    }
    
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}
