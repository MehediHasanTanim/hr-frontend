// src/features/expenses/components/ExpenseApprovalQueue.tsx
// Sprint 10 F6 — Expense approval queue (manager-facing)

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { usePendingExpenseApprovalsQuery } from "@/features/expenses/hooks/usePendingExpenseApprovalsQuery";
import { ExpenseApprovalRow } from "./ExpenseApprovalRow";

export function ExpenseApprovalQueue() {
  const { data, isLoading, isError } = usePendingExpenseApprovalsQuery();

  if (isLoading) {
    return (
      <div
        data-testid="expense-approval-loading"
        className="flex items-center justify-center py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid="expense-approval-error"
        className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        Unable to load pending expense approvals.
      </div>
    );
  }

  const pending = data ?? [];

  return (
    <div data-testid="expense-approval-queue" className="space-y-4">
      <h3 className="text-lg font-semibold">
        Pending Expense Approvals ({pending.length})
      </h3>

      {pending.length === 0 && (
        <div
          data-testid="expense-approval-empty"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          No pending expense claims.
        </div>
      )}

      {pending.map((expense) => (
        <ExpenseApprovalRow key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
