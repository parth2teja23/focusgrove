"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Task } from "@/types";
import { ForestView } from "@/components/ForestView";

export default function ForestPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("done", true)
          .order("created_at", { ascending: false });

        setTasks(data || []);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    const channelPromise = (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) {
        return null;
      }

      return supabase
        .channel(`forest-${user.id}`)
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
  }, [supabase]);

  return (
    <div className="pb-24 p-4">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 -mx-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Your Forest</h1>
        <p className="text-sm text-gray-500">
          Grow trees by completing your study tasks
        </p>
      </div>

      {/* Forest */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border border-green-500 border-t-transparent" />
        </div>
      ) : (
        <ForestView tasks={tasks} />
      )}
    </div>
  );
}
