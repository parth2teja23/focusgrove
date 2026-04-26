"use client";

import { useState, useEffect } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  format,
  addMonths,
  subMonths
} from "date-fns";
import { createBrowserClient } from "@/lib/supabase/client";
import { dateToKey } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayData {
  date: string;
  tasksDone: number;
  totalTasks: number;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const { data: tasks } = await supabase
          .from("tasks")
          .select("id, date, done")
          .eq("user_id", user.id)
          .gte("date", format(monthStart, "yyyy-MM-dd"))
          .lte("date", format(monthEnd, "yyyy-MM-dd"));

        const data: Record<string, DayData> = {};

        if (tasks) {
          for (const task of tasks) {
            if (!data[task.date]) {
              data[task.date] = { date: task.date, tasksDone: 0, totalTasks: 0 };
            }
            data[task.date].totalTasks++;
            if (task.done) {
              data[task.date].tasksDone++;
            }
          }
        }

        setDayData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthData();
  }, [currentMonth, supabase]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="pb-24 p-4">
      {/* Header */}
      <div className="sticky top-0 bg-white p-4 -mx-4 mb-4 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h1>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-sm font-semibold text-gray-600"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border border-green-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateStr = dateToKey(day);
            const data = dayData[dateStr];
            const completionRate = data
              ? Math.round((data.tasksDone / data.totalTasks) * 100)
              : 0;
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={dateStr}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-colors ${
                  !isCurrentMonth
                    ? "border-gray-100 bg-gray-50"
                    : data && data.totalTasks > 0
                    ? completionRate === 100
                      ? "border-green-500 bg-green-50"
                      : "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-bold text-gray-900">
                  {format(day, "d")}
                </div>
                {data && data.totalTasks > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {data.tasksDone}/{data.totalTasks}
                  </div>
                )}
                {completionRate === 100 && data && (
                  <div className="text-lg mt-1">🎉</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
