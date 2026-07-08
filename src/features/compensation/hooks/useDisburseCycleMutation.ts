// src/features/compensation/hooks/useDisburseCycleMutation.ts
// Sprint 10 — Disburse Cycle Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { CompensationCycle } from "@/features/compensation/types/compensation.types";
import { cycleKeys } from "./useCompensationCycleQuery";

async function disburseCycle(cycleId: string): Promise<CompensationCycle> {
  const res = await apiClient.post<CompensationCycle>(
    `/api/v1/compensation/cycles/${cycleId}/disburse`,
  );
  return res.data;
}

export function useDisburseCycleMutation(cycleId: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: () => disburseCycle(cycleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) });
      queryClient.invalidateQueries({ queryKey: cycleKeys.allocations(cycleId) });
      addToast({
        message: `Cycle "${data.name}" has been disbursed.`,
        variant: "success",
        duration: 6_000,
      });
    },
    onError: () => {
      addToast({
        message:
          "Failed to disburse cycle. Ensure all allocations are resolved.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
