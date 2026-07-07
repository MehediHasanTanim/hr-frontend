// src/features/performance/components/GoalProgressBar.tsx
// Sprint 8 F2 — Reusable goal progress bar

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
}

export function GoalProgressBar({ currentValue, targetValue, unit }: GoalProgressBarProps) {
  // Qualitative goal — no bar
  if (targetValue === null || targetValue === undefined || targetValue === 0) {
    return (
      <span className="text-xs text-muted-foreground" data-testid="goal-no-progress">
        Qualitative
      </span>
    );
  }

  const current = currentValue ?? 0;
  const pct = Math.min((current / targetValue) * 100, 100);
  const isOverAchieved = current > targetValue;

  return (
    <div className="w-full space-y-1" data-testid="goal-progress-bar">
      <div className="flex items-center justify-between text-xs">
        <span className="tabular-nums font-medium">
          {current.toLocaleString()} / {targetValue.toLocaleString()}{unit ? ` ${unit}` : ''}
        </span>
        <span className={cn("tabular-nums", isOverAchieved && "text-green-600 font-semibold")}>
          {isOverAchieved ? '>100%' : `${Math.round(pct)}%`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-primary" : pct >= 30 ? "bg-amber-500" : "bg-red-500",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={targetValue}
        />
      </div>
    </div>
  );
}
