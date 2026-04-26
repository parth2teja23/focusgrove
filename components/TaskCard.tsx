"use client";

import { Task } from "@/types";
import { TimerBar } from "./TimerBar";
import { useTimer } from "@/hooks/useTimer";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  onTimerUpdate?: (secondsLeft: number) => void;
}

/**
 * Individual task card component with timer and badges
 */
export function TaskCard({
  task,
  isSelected,
  onSelect,
  onTimerUpdate,
}: TaskCardProps) {
  const [showTimer, setShowTimer] = useState(false);
  
  const timer = useTimer(
    showTimer ? (task.timer_left_seconds || task.duration_minutes! * 60) : null,
    () => {
      // Timer completed - auto-mark as done
      onSelect(task);
    }
  );
  
  useEffect(() => {
    if (onTimerUpdate && showTimer) {
      onTimerUpdate(timer.secondsLeft);
    }
  }, [timer.secondsLeft, showTimer, onTimerUpdate]);
  
  const borderColor = task.done
    ? "border-green-500 bg-green-50"
    : task.carried_from
    ? "border-amber-500"
    : timer.isRunning
    ? "border-blue-500 animate-pulse"
    : "border-gray-200";
  
  return (
    <div
      onClick={() => {
        onSelect(task);
        setShowTimer(false);
      }}
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer transition-all",
        borderColor,
        isSelected && "ring-2 ring-green-300"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-sm truncate",
            task.done ? "line-through text-gray-400" : "text-gray-900"
          )}>
            {task.name}
          </h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {task.done && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
              <Check size={16} className="text-white" />
            </span>
          )}
          {task.carried_from && !task.done && (
            <span className="text-lg">📌</span>
          )}
          {task.duration_minutes && !showTimer && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              {task.duration_minutes}m
            </span>
          )}
        </div>
      </div>
      
      {showTimer && task.duration_minutes && (
        <TimerBar
          secondsLeft={timer.secondsLeft}
          totalSeconds={task.duration_minutes * 60}
          isRunning={timer.isRunning}
        />
      )}
      
      {!task.done && task.duration_minutes && !showTimer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowTimer(true);
            timer.start();
          }}
          className="w-full mt-3 px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"
        >
          <Clock size={14} />
          Start Timer
        </button>
      )}
      
      {showTimer && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (timer.isRunning) {
                timer.pause();
              } else {
                timer.resume();
              }
            }}
            className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
          >
            {timer.isRunning ? "Pause" : "Resume"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              timer.reset();
              setShowTimer(false);
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
