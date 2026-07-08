// src/features/expenses/hooks/usePendingExpenseApprovalsQuery.ts
// Sprint 10 — Pending Expense Approvals Query Hook (manager-facing)

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ExpenseClaim } from "@/features/expenses/types/expenses.types";

async function fetchPendingApprovals(): Promise<ExpenseClaim[]> {
  const res = await apiClient.get<ExpenseClaim[]>(
    "/api/v1/expenses/claims/pending",
  );
  return res.data;
}

export function usePendingExpenseApprovalsQuery() {
  return useQuery({
    queryKey: ["expenses", "pending-approvals"],
    queryFn: fetchPendingApprovals,
  });
}
