// src/features/onboarding/components/TaskChecklist.tsx
// Sprint 8 F1 — Grouped task cards with assignee role filter

"use client";

import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "./TaskCard";
import type { OnboardingTaskInstance, AssigneeRole } from "@/types/onboarding";

const ROLE_TABS: { key: AssigneeRole | 'all'; label: string }[] = [
  { key: 'all', label: 'All Tasks' },
  { key: 'employee', label: 'Employee' },
  { key: 'manager', label: 'Manager' },
  { key: 'hr', label: 'HR' },
  { key: 'it', label: 'IT' },
];

interface TaskChecklistProps {
  tasks: OnboardingTaskInstance[];
  viewerRole: string;
  isReadOnly: boolean;
  isLoading: boolean;
  onComplete: (taskId: string) => void;
}

export function TaskChecklist({
  tasks,
  viewerRole,
  isReadOnly,
  isLoading,
  onComplete,
}: TaskChecklistProps) {
  const [activeFilter, setActiveFilter] = useState<AssigneeRole | 'all'>('all');

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="task-checklist-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const filteredTasks =
    activeFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.assigneeRole === activeFilter);

  return (
    <div className="space-y-4" data-testid="task-checklist">
      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-1">
        {ROLE_TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? tasks.length
              : tasks.filter((t) => t.assigneeRole === tab.key).length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`whitespace-nowrap rounded-t px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === tab.key
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={activeFilter === tab.key}
              data-testid={`filter-${tab.key}`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground" data-testid="task-checklist-empty">
          No tasks in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              viewerRole={viewerRole}
              isDisabled={false}
              isReadOnly={isReadOnly}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
