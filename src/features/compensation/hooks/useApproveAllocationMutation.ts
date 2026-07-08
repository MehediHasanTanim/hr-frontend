// src/features/compensation/hooks/useApproveAllocationMutation.ts
// Sprint 10 — Approve Allocation Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { ApproveAllocationDto } from "@/features/compensation/types/compensation.types";
import { cycleKeys } from "./useCompensationCycleQuery";

async function approveAllocation(dto: ApproveAllocationDto): Promise<void> {
  await apiClient.post("/api/v1/compensation/cycles/allocations/approve", dto);
}

export function useApproveAllocationMutation(cycleId: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: approveAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.allocations(cycleId) });
      queryClient.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) });
    },
    onError: () => {
      addToast({
        message: "Failed to approve allocation.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
