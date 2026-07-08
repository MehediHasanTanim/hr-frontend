// src/features/analytics/hooks/useAttritionRiskScores.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AttritionRiskScore, RiskBand } from "@/features/analytics/types/analytics";

interface AttritionRiskParams {
  department?: string;
  riskBand?: RiskBand;
  sortBy?: string;
}

async function fetchAttritionRiskScores(
  params?: AttritionRiskParams,
): Promise<AttritionRiskScore[]> {
  const res = await apiClient.get<AttritionRiskScore[]>(
    "/api/v1/analytics/attrition-risk",
    { params },
  );
  return res.data;
}

export function useAttritionRiskScores(params?: AttritionRiskParams) {
  return useQuery({
    queryKey: ["analytics", "attrition-risk", params],
    queryFn: () => fetchAttritionRiskScores(params),
  });
}
