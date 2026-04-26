"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { calcLevel } from "@/lib/utils";

/**
 * Custom hook for fetching user profile with real-time updates
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createBrowserClient());
  
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Not authenticated");
        setProfile(null);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
        return;
      }
      
      setProfile(data);
    } catch (err) {
      setError(String(err));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  
  useEffect(() => {
    let isMounted = true;

    fetchProfile();

    const channelPromise = (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) {
        return null;
      }

      return supabase
        .channel(`profiles-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchProfile();
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
  }, [supabase, fetchProfile]);
  
  const level = profile ? calcLevel(profile.xp) : 1;
  
  return { profile, loading, error, level, refetch: fetchProfile };
}
