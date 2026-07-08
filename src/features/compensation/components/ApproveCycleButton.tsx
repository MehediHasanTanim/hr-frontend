// src/features/compensation/components/ApproveCycleButton.tsx
// Sprint 10 F3 — Approve & Disburse Cycle Button

"use client";

import React from "react";
import { Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisburseCycleMutation } from "@/features/compensation/hooks/useDisburseCycleMutation";
import type {
  EmployeeAllocation,
  CompensationCycleStatus,
} from "@/features/compensation/types/compensation.types";

interface ApproveCycleButtonProps {
  cycleId: string;
  cycleStatus: CompensationCycleStatus;
  allocations: EmployeeAllocation[];
}

export function ApproveCycleButton({
  cycleId,
  cycleStatus,
  allocations,
}: ApproveCycleButtonProps) {
  const disburseMutation = useDisburseCycleMutation(cycleId);

  const allResolved = allocations.every(
    (a) => a.status === "APPROVED" || a.status === "REJECTED",
  );
  const canDisburse =
    cycleStatus === "APPROVAL" && allResolved && !disburseMutation.isPending;

  const tooltipText =
    cycleStatus !== "APPROVAL"
      ? "Cycle is not in approval state"
      : !allResolved
        ? "All allocations must be approved or rejected before disbursing"
        : undefined;

  return (
    <button
      type="button"
      data-testid="approve-cycle-btn"
      onClick={() => disburseMutation.mutate()}
      disabled={!canDisburse}
      title={tooltipText}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
        "bg-green-600 text-white hover:bg-green-700",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
      )}
    >
      {disburseMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : !canDisburse ? (
        <Lock className="h-4 w-4" />
      ) : null}
      Disburse Cycle
      {!canDisburse && tooltipText && (
        <span className="sr-only">{tooltipText}</span>
      )}
    </button>
  );
}
