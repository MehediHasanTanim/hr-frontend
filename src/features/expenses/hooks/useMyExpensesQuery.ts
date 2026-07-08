// src/features/expenses/hooks/useMyExpensesQuery.ts
// Sprint 10 — My Expenses Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ExpenseClaim } from "@/features/expenses/types/expenses.types";

async function fetchMyExpenses(): Promise<ExpenseClaim[]> {
  const res = await apiClient.get<ExpenseClaim[]>(
    "/api/v1/expenses/claims/my",
  );
  return res.data;
}

export function useMyExpensesQuery() {
  return useQuery({
    queryKey: ["expenses", "my"],
    queryFn: fetchMyExpenses,
  });
}
