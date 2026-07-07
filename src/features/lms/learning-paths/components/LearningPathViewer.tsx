// src/features/lms/learning-paths/components/LearningPathViewer.tsx
// Sprint 9 F3 — Vertical stepper/timeline for learning path sequence

"use client";

import React from "react";
import { CheckCircle2, Lock, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LearningPathStep } from "@/types/lms";

interface LearningPathViewerProps {
  steps: LearningPathStep[];
  isLoading: boolean;
  pathName?: string;
}

export function LearningPathViewer({ steps, isLoading, pathName }: LearningPathViewerProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="learning-path-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center" data-testid="learning-path-empty">
        <BookOpen className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No steps in this learning path.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0" data-testid="learning-path" aria-label={pathName ?? 'Learning Path'}>
      {steps
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map((step, i) => {
          const isLast = i === steps.length - 1;
          const isLocked = !step.isUnlocked && !step.isCompleted;

          return (
            <li key={step.courseId} className="relative flex gap-4 pb-6">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-5 top-10 h-full w-px bg-border" aria-hidden="true" />
              )}

              {/* Status icon */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                  step.isCompleted && "border-green-500 bg-green-50 text-green-600",
                  !step.isCompleted && step.isUnlocked && "border-primary bg-primary/5 text-primary",
                  isLocked && "border-muted bg-muted/30 text-muted-foreground",
                )}
              >
                {step.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </div>

              {/* Step content */}
              <div className="min-w-0 flex-1 pt-2">
                {isLocked ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-sm font-medium text-muted-foreground cursor-default"
                          tabIndex={-1}
                          aria-disabled="true"
                          data-testid={`locked-step-${step.courseId}`}
                        >
                          {step.courseTitle}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {step.prerequisiteTitle
                            ? `Complete '${step.prerequisiteTitle}' to unlock`
                            : 'Prerequisites not met'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span
                    className="text-sm font-medium"
                    tabIndex={0}
                    data-testid={`unlocked-step-${step.courseId}`}
                  >
                    {step.courseTitle}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  Step {step.sequenceOrder}
                  {step.isCompleted && (
                    <Badge variant="secondary" className="ml-2 text-xs">Completed</Badge>
                  )}
                </p>
              </div>
            </li>
          );
        })}
    </ol>
  );
}
