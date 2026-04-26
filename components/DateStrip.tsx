"use client";

import { getDateLabel, getDateRangeForStrip, dateToKey } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

/**
 * Horizontal scrollable date picker (7 days: 3 past, today, 3 future)
 */
export function DateStrip({ selectedDate, onDateSelect }: DateStripProps) {
  const dates = getDateRangeForStrip(selectedDate);
  
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-2 min-w-min">
        {dates.map((date) => {
          const isSelected = dateToKey(date) === dateToKey(selectedDate);
          const dateObj = new Date(date + "T00:00:00");
          const dayNum = dateObj.getDate();
          const dayName = format(dateObj, "EEE").substring(0, 1);
          
          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 transition-colors",
                isSelected
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="text-xs font-medium text-gray-500">{dayName}</div>
              <div className="text-lg font-bold text-gray-900">{dayNum}</div>
              <div className="text-xs text-gray-400">{getDateLabel(date)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
