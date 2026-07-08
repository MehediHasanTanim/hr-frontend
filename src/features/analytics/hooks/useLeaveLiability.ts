// src/features/analytics/hooks/useLeaveLiability.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { LeaveLiability } from "@/features/analytics/types/analytics";

async function fetchLeaveLiability(): Promise<LeaveLiability> {
  const res = await apiClient.get<LeaveLiability>("/api/v1/analytics/dashboard/leave-liability");
  return res.data;
}

export function useLeaveLiability() {
  return useQuery({
    queryKey: ["analytics", "dashboard", "leave-liability"],
    queryFn: fetchLeaveLiability,
    staleTime: 5 * 60 * 1000,
  });
}
