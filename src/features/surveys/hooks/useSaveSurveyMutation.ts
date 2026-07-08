// src/features/surveys/hooks/useSaveSurveyMutation.ts
// Sprint 10 — Save Survey Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { Survey, SaveSurveyDto } from "@/features/surveys/types/surveys.types";
import { surveyKeys } from "./useSurveyDraftQuery";

async function saveSurvey(dto: SaveSurveyDto): Promise<Survey> {
  const res = await apiClient.post<Survey>("/api/v1/surveys", dto);
  return res.data;
}

async function updateSurvey(
  id: string,
  dto: SaveSurveyDto,
): Promise<Survey> {
  const res = await apiClient.put<Survey>(`/api/v1/surveys/${id}`, dto);
  return res.data;
}

export function useSaveSurveyMutation(surveyId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (dto: SaveSurveyDto) =>
      surveyId ? updateSurvey(surveyId, dto) : saveSurvey(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      addToast({
        message: `Survey "${data.title}" saved.`,
        variant: "success",
        duration: 4_000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to save survey.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
