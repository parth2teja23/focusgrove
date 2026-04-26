"use client";

import { Task } from "@/types";
import { markTaskDone, deleteTask, updateTaskTimer } from "@/lib/actions/tasks";
import { useTimer } from "@/hooks/useTimer";
import { useEffect, useState } from "react";
import { TimerBar } from "./TimerBar";
import { formatTime } from "@/lib/utils";
import confetti from "canvas-confetti";
import { X, Trash2, Clock, CheckCircle2 } from "lucide-react";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

/**
 * Bottom sheet modal for task details
 */
export function TaskModal({ task, isOpen, onClose, onTaskUpdate }: TaskModalProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timer = useTimer(
    showTimer && task?.duration_minutes
      ? task.timer_left_seconds || task.duration_minutes * 60
      : null,
    () => {
      // Timer completed - auto-mark as done
      handleMarkDone();
    }
  );
  
  const handleMarkDone = async () => {
    if (!task) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await markTaskDone(task.id);
      
      if ("error" in result) {
        setError(result.error ?? "Failed to mark task as done");
      } else {
        // Confetti burst
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        
        // Show toast notification
        onTaskUpdate?.();
        onClose();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!task || !confirm("Delete this task?")) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await deleteTask(task.id);
      
      if ("error" in result) {
        setError(result.error ?? "Failed to delete task");
      } else {
        onTaskUpdate?.();
        onClose();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Save timer state when pausing
  useEffect(() => {
    if (!showTimer && task && timer.secondsLeft > 0) {
      updateTaskTimer(task.id, timer.secondsLeft);
    }
  }, [showTimer, task, timer.secondsLeft]);
  
  if (!isOpen || !task) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold truncate">{task.name}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        {task.duration_minutes && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600 font-medium mb-2">Duration</div>
            <div className="text-2xl font-bold text-blue-900">
              {task.duration_minutes} minutes
            </div>
          </div>
        )}
        
        {task.carried_from && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <span className="text-lg">📌</span>
            <span className="text-sm text-amber-900">Carried over from previous day</span>
          </div>
        )}
        
        {showTimer && (
          <div className="space-y-3">
            <TimerBar
              secondsLeft={timer.secondsLeft}
              totalSeconds={task.duration_minutes! * 60}
              isRunning={timer.isRunning}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (timer.isRunning) {
                    timer.pause();
                  } else {
                    timer.resume();
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm disabled:opacity-50"
              >
                {timer.isRunning ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => {
                  timer.reset();
                  setShowTimer(false);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2 pt-4">
          {!task.done && !showTimer && task.duration_minutes && (
            <button
              onClick={() => setShowTimer(true)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Clock size={18} />
              Start Timer
            </button>
          )}
          
          {!task.done && (
            <button
              onClick={handleMarkDone}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              Mark as Done
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
