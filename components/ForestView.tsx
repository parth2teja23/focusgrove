"use client";

import { Task } from "@/types";
import { getTreeEmoji } from "@/lib/utils";

interface ForestViewProps {
  tasks: Task[];
}

/**
 * Animated tree grid showing completed tasks
 */
export function ForestView({ tasks }: ForestViewProps) {
  const completedTasks = tasks.filter((t) => t.done);
  
  if (completedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-4xl mb-3">🌱</div>
        <p className="text-center">
          Complete your first task to plant a tree and grow your forest!
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-5 gap-4">
      {completedTasks.map((task, index) => {
        const emoji = getTreeEmoji(task.duration_minutes);
        
        return (
          <div
            key={task.id}
            className="flex flex-col items-center justify-center p-2 animate-in fade-in zoom-in"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="text-4xl mb-1">{emoji}</div>
            <div className="text-xs text-center text-gray-600 truncate">
              {task.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
