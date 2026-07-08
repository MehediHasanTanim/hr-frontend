// src/features/compensation/components/BonusAllocationTable.tsx
// Sprint 10 F3 — Bonus allocation table with per-employee rows

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import {
  useCompensationCycleQuery,
  useCycleAllocationsQuery,
} from "@/features/compensation/hooks/useCompensationCycleQuery";
import { useProposeAllocationMutation } from "@/features/compensation/hooks/useProposeAllocationMutation";
import { useApproveAllocationMutation } from "@/features/compensation/hooks/useApproveAllocationMutation";
import { BonusCycleBudgetTracker } from "./BonusCycleBudgetTracker";
import { AllocationRow } from "./AllocationRow";
import { ApproveCycleButton } from "./ApproveCycleButton";

interface BonusAllocationTableProps {
  cycleId: string;
}

export function BonusAllocationTable({
  cycleId,
}: BonusAllocationTableProps) {
  const { data: cycle, isLoading: cycleLoading, isError: cycleError } =
    useCompensationCycleQuery(cycleId);
  const {
    data: allocations,
    isLoading: allocationsLoading,
    isError: allocationsError,
  } = useCycleAllocationsQuery(cycleId);

  const proposeMutation = useProposeAllocationMutation(cycleId);
  const approveMutation = useApproveAllocationMutation(cycleId);

  const isLoading = cycleLoading || allocationsLoading;
  const isError = cycleError || allocationsError;

  if (isLoading) {
    return (
      <div
        data-testid="allocation-table-loading"
        className="flex items-center justify-center py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !cycle) {
    return (
      <div
        data-testid="allocation-table-error"
        className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        Unable to load bonus allocation data.
      </div>
    );
  }

  // PLANNING → table hidden, budget shows target only
  if (cycle.status === "PLANNING") {
    return (
      <div data-testid="allocation-table-planning" className="space-y-4">
        <BonusCycleBudgetTracker cycle={cycle} />
        <p className="text-sm text-muted-foreground text-center py-8">
          Allocation table will be available when the cycle opens.
        </p>
      </div>
    );
  }

  const isDisbursed = cycle.status === "DISBURSED";

  return (
    <div data-testid="allocation-table" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{cycle.name}</h3>
          <p className="text-sm text-muted-foreground">
            Fiscal Year {cycle.fiscalYear}
          </p>
        </div>
        {cycle.status === "APPROVAL" && (
          <ApproveCycleButton
            cycleId={cycleId}
            cycleStatus={cycle.status}
            allocations={allocations ?? []}
          />
        )}
      </div>

      <BonusCycleBudgetTracker cycle={cycle} />

      {isDisbursed && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Disbursed on{" "}
          {new Date().toLocaleDateString() /* TODO: get actual disbursedAt from cycle */}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium">Employee</th>
              <th className="px-3 py-2.5 text-center font-medium">
                Target %
              </th>
              <th className="px-3 py-2.5 text-center font-medium">
                Recommended
              </th>
              <th className="px-3 py-2.5 text-left font-medium">
                Proposed
              </th>
              <th className="px-3 py-2.5 text-left font-medium">
                Approved
              </th>
              <th className="px-3 py-2.5 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {allocations?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No employees allocated for this cycle.
                </td>
              </tr>
            )}
            {allocations?.map((alloc) => (
              <AllocationRow
                key={alloc.employeeId}
                allocation={alloc}
                cycleStatus={cycle.status}
                onPropose={(employeeId, amount) =>
                  proposeMutation.mutate({ cycleId, employeeId, proposedAmount: amount })
                }
                onApprove={(employeeId, amount) =>
                  approveMutation.mutate({ cycleId, employeeId, approvedAmount: amount })
                }
                isProposing={proposeMutation.isPending}
                isApproving={approveMutation.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
