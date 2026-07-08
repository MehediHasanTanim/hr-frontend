// src/features/compensation/components/AllocationRow.tsx
// Sprint 10 F3 — Single employee row in the bonus allocation table

"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type {
  EmployeeAllocation,
  CompensationCycleStatus,
} from "@/features/compensation/types/compensation.types";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PROPOSED: { label: "Proposed", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  DISBURSED: { label: "Disbursed", variant: "default" },
};

interface AllocationRowProps {
  allocation: EmployeeAllocation;
  cycleStatus: CompensationCycleStatus;
  onPropose: (employeeId: string, amount: number) => void;
  onApprove: (employeeId: string, amount: number) => void;
  isProposing: boolean;
  isApproving: boolean;
}

export function AllocationRow({
  allocation,
  cycleStatus,
  onPropose,
  onApprove,
  isProposing,
  isApproving,
}: AllocationRowProps) {
  const [editAmount, setEditAmount] = useState<number | null>(
    allocation.proposedAmount,
  );
  const [approveAmount, setApproveAmount] = useState<number | null>(
    allocation.approvedAmount,
  );

  const isOpenEditable = cycleStatus === "OPEN";
  const isApprovalEditable = cycleStatus === "APPROVAL";

  const badgeCfg = STATUS_BADGE[allocation.status] ?? {
    label: allocation.status,
    variant: "outline" as const,
  };

  return (
    <tr
      data-testid={`allocation-row-${allocation.employeeId}`}
      className="border-b transition-colors hover:bg-muted/30"
    >
      <td className="px-3 py-2.5 text-sm">{allocation.employeeName}</td>
      <td className="px-3 py-2.5 text-sm text-center">
        {allocation.targetPercent}%
      </td>
      <td className="px-3 py-2.5 text-sm text-center">
        {allocation.recommendedAmount !== null
          ? formatCurrency(allocation.recommendedAmount)
          : "—"}
      </td>
      <td className="px-3 py-2.5">
        {isOpenEditable ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={editAmount ?? ""}
              data-testid={`propose-input-${allocation.employeeId}`}
              onChange={(e) =>
                setEditAmount(
                  e.target.value === "" ? null : parseFloat(e.target.value),
                )
              }
              className="h-8 w-28 text-sm"
              disabled={isProposing}
            />
            <button
              type="button"
              data-testid={`propose-btn-${allocation.employeeId}`}
              onClick={() => {
                if (editAmount != null) {
                  onPropose(allocation.employeeId, editAmount);
                }
              }}
              disabled={isProposing || editAmount == null}
              className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        ) : (
          <span className="text-sm">
            {allocation.proposedAmount !== null
              ? formatCurrency(allocation.proposedAmount)
              : "—"}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {isApprovalEditable ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={approveAmount ?? ""}
              data-testid={`approve-input-${allocation.employeeId}`}
              onChange={(e) =>
                setApproveAmount(
                  e.target.value === "" ? null : parseFloat(e.target.value),
                )
              }
              className="h-8 w-28 text-sm"
              disabled={isApproving}
            />
            <button
              type="button"
              data-testid={`approve-btn-${allocation.employeeId}`}
              onClick={() => {
                if (approveAmount != null) {
                  onApprove(allocation.employeeId, approveAmount);
                }
              }}
              disabled={isApproving || approveAmount == null}
              className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
          </div>
        ) : (
          <span className="text-sm">
            {allocation.approvedAmount !== null
              ? formatCurrency(allocation.approvedAmount)
              : "—"}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-center">
        <Badge variant={badgeCfg.variant}>{badgeCfg.label}</Badge>
      </td>
    </tr>
  );
}
