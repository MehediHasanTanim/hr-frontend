// src/features/surveys/hooks/useMySurveyAssignmentsQuery.ts
// Sprint 10 — My Survey Assignments Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SurveyAssignment } from "@/features/surveys/types/surveys.types";

export const assignmentKeys = {
  all: ["survey-assignments"] as const,
  my: () => [...assignmentKeys.all, "my"] as const,
};

async function fetchMyAssignments(): Promise<SurveyAssignment[]> {
  const res = await apiClient.get<SurveyAssignment[]>(
    "/api/v1/surveys/assignments/my",
  );
  return res.data;
}

export function useMySurveyAssignmentsQuery() {
  return useQuery({
    queryKey: assignmentKeys.my(),
    queryFn: fetchMyAssignments,
  });
}
