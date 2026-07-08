// src/features/analytics/components/ExecutiveDashboard/LeaveLiabilityWidget.tsx
// Sprint 11 F1 — Leave liability aggregate with expandable breakdown

"use client";
import React, { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaveLiability } from "@/features/analytics/types/analytics";

interface Props {
  data: LeaveLiability | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function LeaveLiabilityWidget({ data, isLoading, isError }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Unable to load leave liability.
      </div>
    );
  }

  return (
    <div data-testid="leave-liability-widget" className="rounded-lg border p-4">
      <button
        type="button"
        data-testid="leave-liability-toggle"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div>
          <h4 className="text-sm font-semibold">Leave Liability</h4>
          <p className="mt-1 text-2xl font-bold">
            {data.totalAccruedDays.toLocaleString()} days
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <div data-testid="leave-liability-breakdown" className="mt-3 space-y-1 border-t pt-3">
          {data.breakdown.map((b) => (
            <div key={b.leaveType} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{b.leaveType}</span>
              <span className="font-medium">{b.days.toLocaleString()} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
