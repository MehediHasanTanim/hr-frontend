// src/features/lms/learning-paths/api.ts
// Sprint 9 F3 — Learning Paths API hooks

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { LearningPath } from "@/types/lms";

export const learningPathKeys = {
  all: ['lms', 'learning-paths'] as const,
  detail: (id: string) => [...learningPathKeys.all, 'detail', id] as const,
};

export function useLearningPathQuery(id: string) {
  return useQuery({
    queryKey: learningPathKeys.detail(id),
    queryFn: () =>
      apiClient.get<LearningPath>(`/api/v1/lms/learning-paths/${id}`).then((r) => r.data),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
