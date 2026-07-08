// src/features/surveys/hooks/useSubmitSurveyResponseMutation.ts
// Sprint 10 — Submit Survey Response Mutation Hook
//
// CRITICAL: This mutation deliberately takes no employeeId — the
// submitSurveyResponseSchema and SubmitSurveyResponseDto have no
// identity field. Anonymity is enforced at the TypeScript type level.

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { SubmitSurveyResponseDto } from "@/features/surveys/types/surveys.types";
import { assignmentKeys } from "./useMySurveyAssignmentsQuery";

async function submitSurveyResponse(dto: SubmitSurveyResponseDto): Promise<void> {
  await apiClient.post("/api/v1/surveys/responses", dto);
}

export function useSubmitSurveyResponseMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: submitSurveyResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      addToast({
        message: "Your response has been submitted anonymously.",
        variant: "success",
        duration: 5_000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to submit survey response.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
