// src/features/onboarding/components/TaskCard.tsx
// Sprint 8 F1 — Single onboarding task card

"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OverdueBadge } from "@/components/ui/OverdueBadge";
import type { OnboardingTaskInstance } from "@/types/onboarding";
import { CATEGORY_COLORS } from "@/types/onboarding";

interface TaskCardProps {
  task: OnboardingTaskInstance;
  viewerRole: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  onComplete: (taskId: string) => void;
}

export function TaskCard({ task, viewerRole, isDisabled, isReadOnly, onComplete }: TaskCardProps) {
  const isDone = task.status === 'completed' || task.status === 'skipped';
  const notOwnTask = task.assigneeRole !== viewerRole && viewerRole !== 'hr';

  const button = (
    <Button
      variant={isDone ? "ghost" : "outline"}
      size="icon"
      className="h-8 w-8 shrink-0"
      disabled={isDone || isDisabled || isReadOnly || notOwnTask}
      onClick={() => onComplete(task.id)}
      aria-label={isDone ? 'Task completed' : `Mark "${task.title}" as done`}
      data-testid={`complete-task-${task.id}`}
    >
      {isDone ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <Circle className="h-5 w-5" />
      )}
    </Button>
  );

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        isDone && "bg-muted/30 opacity-70",
        !isDone && task.status === 'in_progress' && "border-amber-300 bg-amber-50/30",
      )}
      data-testid={`task-card-${task.id}`}
    >
      {/* Complete button (with tooltip if not owner) */}
      {notOwnTask && !isDone ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{button}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {task.assigneeRole === 'it'
                  ? 'This task is assigned to IT'
                  : task.assigneeRole === 'manager'
                    ? 'This task is assigned to the manager'
                    : task.assigneeRole === 'hr'
                      ? 'This task is assigned to HR'
                      : 'This task is assigned to the employee'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("text-sm font-medium", isDone && "line-through")}>
            {task.title}
          </p>
          <Badge
            variant="outline"
            className={cn("text-xs", CATEGORY_COLORS[task.category])}
          >
            {task.category.replace(/_/g, ' ')}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Assigned to: <strong>{task.assigneeRole}</strong></span>
          <span>·</span>
          <span>Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
          <OverdueBadge dueDate={task.dueDate} isCompleted={isDone} />
        </div>
      </div>
    </div>
  );
}
