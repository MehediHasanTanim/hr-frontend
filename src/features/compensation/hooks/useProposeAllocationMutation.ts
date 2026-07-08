// src/features/compensation/hooks/useProposeAllocationMutation.ts
// Sprint 10 — Propose Allocation Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { ProposeAllocationDto } from "@/features/compensation/types/compensation.types";
import { cycleKeys } from "./useCompensationCycleQuery";

async function proposeAllocation(dto: ProposeAllocationDto): Promise<void> {
  await apiClient.post("/api/v1/compensation/cycles/allocations/propose", dto);
}

export function useProposeAllocationMutation(cycleId: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: proposeAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.allocations(cycleId) });
      queryClient.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) });
    },
    onError: () => {
      addToast({
        message: "Failed to propose allocation.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
