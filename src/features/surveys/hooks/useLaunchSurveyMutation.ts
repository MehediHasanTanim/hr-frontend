// src/features/surveys/hooks/useLaunchSurveyMutation.ts
// Sprint 10 — Launch Survey Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { Survey, LaunchSurveyDto } from "@/features/surveys/types/surveys.types";
import { surveyKeys } from "./useSurveyDraftQuery";

async function launchSurvey(
  surveyId: string,
  dto: LaunchSurveyDto,
): Promise<Survey> {
  const res = await apiClient.post<Survey>(
    `/api/v1/surveys/${surveyId}/launch`,
    dto,
  );
  return res.data;
}

export function useLaunchSurveyMutation(surveyId: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (dto: LaunchSurveyDto) => launchSurvey(surveyId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      addToast({
        message: "Survey launched successfully.",
        variant: "success",
        duration: 4_000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to launch survey.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
