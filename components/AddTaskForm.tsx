"use client";

import { useState } from "react";
import { addTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface AddTaskFormProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
}

const DURATION_PRESETS = [
  { label: "No timer", value: null },
  { label: "10 min", value: 10 },
  { label: "20 min", value: 20 },
  { label: "25 min", value: 25 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

/**
 * Slide-up form to add a new task
 */
export function AddTaskForm({ date, isOpen, onClose, onTaskAdded }: AddTaskFormProps) {
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const finalDuration = customDuration ? parseInt(customDuration) : duration;
      const result = await addTask(taskName, finalDuration, date);
      
      if ("error" in result) {
        setError(result.error);
      } else {
        setTaskName("");
        setDuration(null);
        setCustomDuration("");
        onClose();
        onTaskAdded?.();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Add Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <Input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="What do you want to focus on?"
              className="text-black placeholder:text-gray-500"
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.value || "none"}
                  type="button"
                  onClick={() => {
                    setDuration(preset.value);
                    setCustomDuration("");
                  }}
                  disabled={isSubmitting}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    duration === preset.value
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Duration (minutes)
            </label>
            <Input
              type="number"
              value={customDuration}
              onChange={(e) => {
                setCustomDuration(e.target.value);
                setDuration(null);
              }}
              placeholder="e.g. 90"
              className="text-black placeholder:text-gray-500"
              min="1"
              disabled={isSubmitting}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
