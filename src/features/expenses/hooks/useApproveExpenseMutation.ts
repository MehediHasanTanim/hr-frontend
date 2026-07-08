// src/features/expenses/hooks/useApproveExpenseMutation.ts
// Sprint 10 — Approve / Reject Expense Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  ApproveExpenseDto,
  RejectExpenseDto,
} from "@/features/expenses/types/expenses.types";
import { expenseKeys } from "./useSubmitExpenseMutation";

async function approveExpense(dto: ApproveExpenseDto): Promise<void> {
  await apiClient.post(`/api/v1/expenses/claims/${dto.id}/approve`);
}

async function rejectExpense(dto: RejectExpenseDto): Promise<void> {
  await apiClient.post(`/api/v1/expenses/claims/${dto.id}/reject`, {
    rejectionReason: dto.rejectionReason,
  });
}

export function useApproveExpenseMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const approveMutation = useMutation({
    mutationFn: approveExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.my() });
      addToast({
        message: "Expense approved.",
        variant: "success",
        duration: 4_000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to approve expense.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.my() });
      addToast({
        message: "Expense rejected.",
        variant: "success",
        duration: 4_000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to reject expense.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });

  return { approveMutation, rejectMutation };
}
