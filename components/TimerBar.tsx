"use client";

import { formatTime } from "@/lib/utils";

interface TimerBarProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
}

/**
 * Progress bar + countdown timer display
 */
export function TimerBar({ secondsLeft, totalSeconds, isRunning }: TimerBarProps) {
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  
  return (
    <div className="w-full">
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
            isRunning ? "bg-blue-500" : "bg-gray-400"
          }`}
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-900">
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}
