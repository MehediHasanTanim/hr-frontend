// src/components/ui/OverdueBadge.tsx
// Sprint 8 — Shared overdue indicator (reused by onboarding, PIP, action items)

"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OverdueBadgeProps {
  dueDate: string; // ISO date string
  isCompleted: boolean;
  className?: string;
}

export function OverdueBadge({ dueDate, isCompleted, className }: OverdueBadgeProps) {
  const now = new Date();
  const due = new Date(dueDate);
  const isOverdue = !isCompleted && due < now;

  if (!isOverdue) return null;

  const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Badge
      variant="destructive"
      className={cn("flex items-center gap-1 text-xs", className)}
      data-testid="overdue-badge"
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      <span>
        {daysOverdue === 0
          ? "Due today"
          : daysOverdue === 1
            ? "1 day overdue"
            : `${daysOverdue} days overdue`}
      </span>
    </Badge>
  );
}
