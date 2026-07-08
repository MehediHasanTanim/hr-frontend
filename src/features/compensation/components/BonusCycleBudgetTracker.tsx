// src/features/compensation/components/BonusCycleBudgetTracker.tsx
// Sprint 10 F3 — Budget tracker gauge for bonus cycles

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { CompensationCycle } from "@/features/compensation/types/compensation.types";

interface BonusCycleBudgetTrackerProps {
  cycle: CompensationCycle;
}

export function BonusCycleBudgetTracker({
  cycle,
}: BonusCycleBudgetTrackerProps) {
  const pct = cycle.totalBudget > 0 ? (cycle.allocatedTotal / cycle.totalBudget) * 100 : 0;
  const isWarning = pct >= 80 && pct < 100;
  const isOverBudget = pct >= 100;

  return (
    <div data-testid="budget-tracker" className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Budget Allocation
        </span>
        <span
          className={cn(
            "text-sm font-bold",
            isOverBudget
              ? "text-destructive"
              : isWarning
                ? "text-amber-600"
                : "text-foreground",
          )}
        >
          {formatCurrency(cycle.allocatedTotal)} / {formatCurrency(cycle.totalBudget)}
        </span>
      </div>

      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          role="progressbar"
          data-testid="budget-progress-bar"
          aria-valuenow={Math.min(pct, 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isOverBudget
              ? "bg-destructive"
              : isWarning
                ? "bg-amber-500"
                : "bg-primary",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span>{pct.toFixed(1)}% allocated</span>
        {isWarning && !isOverBudget && (
          <span className="text-amber-600 font-medium">
            Approaching budget limit
          </span>
        )}
        {isOverBudget && (
          <span className="text-destructive font-medium">
            Budget exceeded
          </span>
        )}
      </div>
    </div>
  );
}
