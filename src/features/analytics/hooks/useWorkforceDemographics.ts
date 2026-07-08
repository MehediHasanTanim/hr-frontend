// src/features/analytics/hooks/useWorkforceDemographics.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { WorkforceDemographics } from "@/features/analytics/types/analytics";

async function fetchWorkforceDemographics(): Promise<WorkforceDemographics> {
  const res = await apiClient.get<WorkforceDemographics>(
    "/api/v1/analytics/dashboard/workforce-demographics",
  );
  return res.data;
}

export function useWorkforceDemographics() {
  return useQuery({
    queryKey: ["analytics", "dashboard", "workforce-demographics"],
    queryFn: fetchWorkforceDemographics,
    staleTime: 5 * 60 * 1000,
  });
}
