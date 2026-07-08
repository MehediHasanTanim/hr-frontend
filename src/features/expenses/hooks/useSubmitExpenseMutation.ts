// src/features/expenses/hooks/useSubmitExpenseMutation.ts
// Sprint 10 — Submit Expense Claim Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { ExpenseClaimDto, ExpenseClaim } from "@/features/expenses/types/expenses.types";

export const expenseKeys = {
  all: ["expenses"] as const,
  my: () => [...expenseKeys.all, "my"] as const,
  pending: () => [...expenseKeys.all, "pending-approvals"] as const,
};

async function submitExpense(dto: ExpenseClaimDto): Promise<ExpenseClaim> {
  const res = await apiClient.post<ExpenseClaim>(
    "/api/v1/expenses/claims",
    dto,
  );
  return res.data;
}

export function useSubmitExpenseMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: submitExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.my() });
      addToast({
        message: "Expense claim submitted successfully.",
        variant: "success",
        duration: 5_000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to submit expense claim.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
