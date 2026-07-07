// src/features/skills/matrix/api.ts
// Sprint 9 F4 — Skills Matrix API hooks

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { SkillsMatrixResponse, SkillsMatrixFilters } from "@/types/skills";

export const skillsMatrixKeys = {
  all: ['skills-matrix'] as const,
  filtered: (filters: SkillsMatrixFilters) => [...skillsMatrixKeys.all, filters] as const,
};

export function useSkillsMatrixQuery(filters: SkillsMatrixFilters) {
  return useQuery({
    queryKey: skillsMatrixKeys.filtered(filters),
    queryFn: () =>
      apiClient.get<SkillsMatrixResponse>('/api/v1/skills/matrix', { params: filters }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSelfAssessMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: { skillId: string; level: number }) =>
      apiClient.post('/api/v1/skills/self-assess', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillsMatrixKeys.all });
      addToast({ message: 'Skill self-assessed.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to save assessment.', variant: 'danger', duration: 5000 }),
  });
}

export function useValidateSkillMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: { employeeId: string; skillId: string; validatedLevel: number }) =>
      apiClient.post('/api/v1/skills/validate', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillsMatrixKeys.all });
      addToast({ message: 'Skill validated.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to validate skill.', variant: 'danger', duration: 5000 }),
  });
}
