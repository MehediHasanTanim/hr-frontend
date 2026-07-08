// src/features/benefits/hooks/useBenefitPlansQuery.ts
// Sprint 10 — Benefit Plans Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { BenefitPlan } from "@/features/benefits/types/benefits.types";

export const benefitPlanKeys = {
  all: ["benefit-plans"] as const,
  list: () => [...benefitPlanKeys.all, "list"] as const,
  byType: (type: string) =>
    [...benefitPlanKeys.all, "byType", type] as const,
};

async function fetchBenefitPlans(): Promise<BenefitPlan[]> {
  const res = await apiClient.get<BenefitPlan[]>("/api/v1/benefits/plans");
  return res.data;
}

export function useBenefitPlansQuery() {
  return useQuery({
    queryKey: benefitPlanKeys.list(),
    queryFn: fetchBenefitPlans,
  });
}
