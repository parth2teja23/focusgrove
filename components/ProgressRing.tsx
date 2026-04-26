"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  done: number;
  total: number;
  className?: string;
}

/**
 * SVG progress ring showing done/total tasks
 */
export function ProgressRing({ done, total, className }: ProgressRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (done / (total || 1)) * circumference;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
  
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg width="100" height="100" className="transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-green-500 transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
        <div className="text-xs text-gray-500">{done}/{total}</div>
      </div>
    </div>
  );
}
