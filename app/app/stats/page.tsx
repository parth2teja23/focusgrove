"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { format, subDays } from "date-fns";
import { dateToKey, calcLevel } from "@/lib/utils";
import { Flame, Zap, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyData {
  day: string;
  tasks: number;
}

export default function StatsPage() {
  const { profile, loading: profileLoading } = useProfile();
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const data: WeeklyData[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const day = subDays(today, i);
          const dateStr = dateToKey(day);

          const { count } = await supabase
            .from("tasks")
            .select("*", { count: "exact" })
            .eq("user_id", user.id)
            .eq("date", dateStr)
            .eq("done", true);

          data.push({
            day: format(day, "EEE"),
            tasks: count || 0,
          });
        }

        setWeeklyData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStats();
  }, [supabase]);

  const level = profile ? calcLevel(profile.xp) : 1;
  const nextLevelXP = level * 100;
  const currentLevelXP = (level - 1) * 100;
  const xpProgress = profile
    ? ((profile.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 0;

  return (
    <div className="pb-24 p-4 space-y-6">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 -mx-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Stats</h1>
        <p className="text-sm text-gray-500">Your progress and achievements</p>
      </div>

      {profileLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border border-green-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Level and XP */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Current Level</p>
                <p className="text-4xl font-bold">{level}</p>
              </div>
              <div className="text-5xl">🏆</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Experience</p>
                <p className="text-sm font-bold">{profile?.xp || 0} XP</p>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs opacity-75 mt-1">
                {currentLevelXP} → {nextLevelXP} XP
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="text-orange-500" size={20} />
                <span className="text-sm font-medium text-gray-600">Streak</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {profile?.streak || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>

            {/* Total XP */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-blue-500" size={20} />
                <span className="text-sm font-medium text-gray-600">
                  Total XP
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {profile?.xp || 0}
              </p>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-500" size={20} />
              <h2 className="text-lg font-bold">This Week</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border border-green-500 border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tasks" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="font-semibold text-green-900 text-sm">Pro Tip</p>
              <p className="text-xs text-green-700 mt-1">
                Complete at least one task every day to build your streak and
                unlock new achievements!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
