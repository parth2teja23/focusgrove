"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Task } from "@/types";

/**
 * Custom hook for fetching tasks with real-time subscription
 */
export function useTasks(dateStr: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createBrowserClient());
  
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Not authenticated");
        setTasks([]);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .order("created_at", { ascending: true });
      
      if (fetchError) {
        setError(fetchError.message);
        setTasks([]);
        return;
      }
      
      setTasks(data || []);
    } catch (err) {
      setError(String(err));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [dateStr, supabase]);
  
  useEffect(() => {
    let isMounted = true;

    fetchTasks();

    const channelPromise = (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) {
        return null;
      }

      return supabase
        .channel(`tasks-${user.id}-${dateStr}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchTasks();
          }
        )
        .subscribe();
    })();

    return () => {
      isMounted = false;
      channelPromise.then((channel) => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [dateStr, supabase, fetchTasks]);
  
  return { tasks, loading, error, refetch: fetchTasks };
}
