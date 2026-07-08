// src/features/surveys/hooks/useSurveyDraftQuery.ts
// Sprint 10 — Survey Draft Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Survey } from "@/features/surveys/types/surveys.types";

export const surveyKeys = {
  all: ["surveys"] as const,
  detail: (id: string) => [...surveyKeys.all, "detail", id] as const,
  list: () => [...surveyKeys.all, "list"] as const,
};

async function fetchSurvey(id: string): Promise<Survey> {
  const res = await apiClient.get<Survey>(`/api/v1/surveys/${id}`);
  return res.data;
}

export function useSurveyDraftQuery(id: string) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => fetchSurvey(id),
    enabled: !!id,
  });
}
