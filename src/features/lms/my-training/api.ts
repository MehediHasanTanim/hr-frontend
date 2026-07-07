// src/features/lms/my-training/api.ts
// Sprint 9 F5 — My Training (ESS) API hooks

"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MyTrainingItem, MyCertification } from "@/types/lms";

export const myTrainingKeys = {
  all: ['lms', 'my-training'] as const,
  enrollments: () => [...myTrainingKeys.all, 'enrollments'] as const,
  certifications: () => [...myTrainingKeys.all, 'certifications'] as const,
};

export function useMyTrainingQuery() {
  // Try combined endpoint first; fall back to composing two queries
  return useQuery({
    queryKey: myTrainingKeys.all,
    queryFn: async () => {
      // Attempt combined endpoint
      try {
        const res = await apiClient.get<{
          enrollments: MyTrainingItem[];
          certifications: MyCertification[];
        }>('/api/v1/lms/my-training');
        return res.data;
      } catch {
        // Fallback: compose two separate calls
        const [enrollRes, certRes] = await Promise.all([
          apiClient.get<MyTrainingItem[]>('/api/v1/lms/my-training/enrollments'),
          apiClient.get<MyCertification[]>('/api/v1/lms/my-training/certifications'),
        ]);
        return {
          enrollments: enrollRes.data,
          certifications: certRes.data,
        };
      }
    },
    staleTime: 60 * 1000,
  });
}
