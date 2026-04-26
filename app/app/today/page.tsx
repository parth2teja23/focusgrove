"use client";

import { useState, useEffect } from "react";
import { dateToKey } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfile";
import { carryOverIncompleteTasks } from "@/lib/actions/carryover";
import { DateStrip } from "@/components/DateStrip";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskModal } from "@/components/TaskModal";
import { ProgressRing } from "@/components/ProgressRing";
import { Task } from "@/types";
import { updateTaskTimer } from "@/lib/actions/tasks";
import { Plus } from "lucide-react";

export default function TodayPage() {
  const today = dateToKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { tasks, loading, refetch } = useTasks(selectedDate);
  const { profile } = useProfile();

  // Carry over incomplete tasks on mount and when date changes
  useEffect(() => {
    carryOverIncompleteTasks(profile?.id || "", selectedDate);
    refetch();
  }, [selectedDate, profile?.id, refetch]);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = () => {
    refetch();
    setIsTaskModalOpen(false);
    setToastMessage("✨ Great work! Keep it up!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <ProgressRing done={completedCount} total={totalCount} />
        </div>

        <DateStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      </div>

      {/* Tasks */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border border-green-500 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-center mb-4">No tasks for this day yet</p>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Add your first task
            </button>
          </div>
        ) : (
          <>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask?.id === task.id}
                onSelect={handleTaskSelect}
                onTimerUpdate={(secondsLeft) => {
                  updateTaskTimer(task.id, secondsLeft);
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Add Task Button */}
      <div className="fixed bottom-20 right-4">
        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Modals */}
      <AddTaskForm
        date={selectedDate}
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskAdded={() => {
          refetch();
          setIsAddTaskOpen(false);
        }}
      />

      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleTaskUpdated}
      />
    </div>
  );
}
