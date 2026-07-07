// src/features/onboarding/components/OnboardingProgressHeader.tsx
// Sprint 8 F1 — Onboarding progress bar + status

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OnboardingStatus } from "@/types/onboarding";

interface OnboardingProgressHeaderProps {
  completionPercentage: number;
  hireDate: string;
  status: OnboardingStatus;
  employeeName?: string;
  isLoading: boolean;
}

const statusBadge: Record<OnboardingStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export function OnboardingProgressHeader({
  completionPercentage,
  hireDate,
  status,
  employeeName,
  isLoading,
}: OnboardingProgressHeaderProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" data-testid="onboarding-header-loading">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  const statusInfo = statusBadge[status];

  return (
    <div className="space-y-3" data-testid="onboarding-header">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">
          {employeeName ? `${employeeName}'s Onboarding` : 'Onboarding'}
        </h2>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        {status === 'completed' && (
          <span className="text-sm text-green-600 dark:text-green-400">
            ✓ All tasks completed
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>Hire date: {new Date(hireDate).toLocaleDateString('en-GB')}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="font-medium tabular-nums">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted">
          <div
            className={cn(
              "h-3 rounded-full transition-all duration-500",
              completionPercentage >= 100 ? "bg-green-500" : "bg-primary",
            )}
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
