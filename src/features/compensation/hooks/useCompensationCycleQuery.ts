// src/features/compensation/hooks/useCompensationCycleQuery.ts
// Sprint 10 — Compensation Cycle Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CompensationCycle,
  EmployeeAllocation,
} from "@/features/compensation/types/compensation.types";

export const cycleKeys = {
  all: ["compensation-cycles"] as const,
  detail: (id: string) => [...cycleKeys.all, "detail", id] as const,
  allocations: (cycleId: string) =>
    [...cycleKeys.all, "allocations", cycleId] as const,
};

async function fetchCompensationCycle(cycleId: string): Promise<CompensationCycle> {
  const res = await apiClient.get<CompensationCycle>(
    `/api/v1/compensation/cycles/${cycleId}`,
  );
  return res.data;
}

async function fetchCycleAllocations(
  cycleId: string,
): Promise<EmployeeAllocation[]> {
  const res = await apiClient.get<EmployeeAllocation[]>(
    `/api/v1/compensation/cycles/${cycleId}/allocations`,
  );
  return res.data;
}

export function useCompensationCycleQuery(cycleId: string) {
  return useQuery({
    queryKey: cycleKeys.detail(cycleId),
    queryFn: () => fetchCompensationCycle(cycleId),
    enabled: !!cycleId,
  });
}

export function useCycleAllocationsQuery(cycleId: string) {
  return useQuery({
    queryKey: cycleKeys.allocations(cycleId),
    queryFn: () => fetchCycleAllocations(cycleId),
    enabled: !!cycleId,
  });
}
