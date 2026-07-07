// src/features/lms/my-training/components/ProgressBar.tsx
// Sprint 9 — Simple progress bar (reusable)

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("h-2 w-full rounded-full bg-muted", className)}>
      <div
        className={cn("h-2 rounded-full transition-all", pct >= 100 ? "bg-green-500" : "bg-primary")}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
