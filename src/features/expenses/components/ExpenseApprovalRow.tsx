// src/features/expenses/components/ExpenseApprovalRow.tsx
// Sprint 10 F6 — Single expense approval row (manager-facing)

"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useApproveExpenseMutation } from "@/features/expenses/hooks/useApproveExpenseMutation";
import type { ExpenseClaim } from "@/features/expenses/types/expenses.types";

interface ExpenseApprovalRowProps {
  expense: ExpenseClaim;
}

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PAID: "bg-blue-100 text-blue-800",
};

export function ExpenseApprovalRow({ expense }: ExpenseApprovalRowProps) {
  const { approveMutation, rejectMutation } = useApproveExpenseMutation();
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    rejectMutation.mutate(
      { id: expense.id, rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setShowRejectReason(false);
          setRejectionReason("");
        },
      },
    );
  };

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div
      data-testid={`expense-approval-row-${expense.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{expense.employeeName}</span>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              STATUS_BADGES[expense.status] ?? "bg-muted text-muted-foreground",
            )}
          >
            {expense.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {expense.category} · {formatCurrency(expense.amount)} ·{" "}
          {expense.date}
        </p>
        {expense.description && (
          <p className="text-xs text-muted-foreground">
            {expense.description}
          </p>
        )}
      </div>

      {expense.status === "PENDING" && (
        <div className="flex items-center gap-2">
          {showRejectReason ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                data-testid={`reject-reason-input-${expense.id}`}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection"
                className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs min-w-[160px]"
                disabled={isBusy}
              />
              <button
                type="button"
                data-testid={`confirm-reject-btn-${expense.id}`}
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isBusy}
                className="rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                type="button"
                data-testid={`cancel-reject-btn-${expense.id}`}
                onClick={() => {
                  setShowRejectReason(false);
                  setRejectionReason("");
                }}
                disabled={isBusy}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                data-testid={`approve-expense-btn-${expense.id}`}
                onClick={() => approveMutation.mutate({ id: expense.id })}
                disabled={isBusy}
                className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {approveMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                Approve
              </button>
              <button
                type="button"
                data-testid={`reject-expense-btn-${expense.id}`}
                onClick={() => setShowRejectReason(true)}
                disabled={isBusy}
                className="inline-flex items-center gap-1 rounded bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
