// src/features/onboarding/api.ts
// Sprint 8 F1 — Onboarding API hooks & keys

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { EmployeeOnboardingSummary, OnboardingTaskInstance } from "@/types/onboarding";

export const onboardingKeys = {
  all: ['onboarding'] as const,
  detail: (employeeId: string) => [...onboardingKeys.all, employeeId] as const,
};

async function fetchOnboarding(employeeId: string) {
  const res = await apiClient.get<EmployeeOnboardingSummary>(
    `/api/v1/onboarding/employees/${employeeId}`,
  );
  return res.data;
}

async function completeTask(taskId: string) {
  const res = await apiClient.patch<OnboardingTaskInstance>(
    `/api/v1/onboarding/tasks/${taskId}/complete`,
  );
  return res.data;
}

async function cancelOnboarding(employeeId: string) {
  const res = await apiClient.post(`/api/v1/onboarding/employees/${employeeId}/cancel`);
  return res.data;
}

export function useEmployeeOnboarding(employeeId: string) {
  return useQuery({
    queryKey: onboardingKeys.detail(employeeId),
    queryFn: () => fetchOnboarding(employeeId),
    enabled: !!employeeId,
    staleTime: 30 * 1000,
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (taskId: string) => completeTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: onboardingKeys.all });
      // Snapshot for rollback
      const prev = queryClient.getQueriesData({ queryKey: onboardingKeys.all });
      // Optimistic: mark task as completed in all cached onboarding summaries
      queryClient.setQueriesData(
        { queryKey: onboardingKeys.all, type: 'active' },
        (old: unknown) => {
          if (!old || typeof old !== 'object' || !('tasks' in (old as Record<string, unknown>))) return old;
          const data = old as EmployeeOnboardingSummary;
          return {
            ...data,
            tasks: data.tasks.map((t) =>
              t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t,
            ),
          };
        },
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        for (const [key, data] of context.prev) {
          queryClient.setQueryData(key, data);
        }
      }
      addToast({ message: 'Failed to complete task.', variant: 'danger', duration: 5000 });
    },
    onSuccess: () => {
      addToast({ message: 'Task completed.', variant: 'success', duration: 3000 });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
    },
  });
}

export function useCancelOnboarding() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (employeeId: string) => cancelOnboarding(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
      addToast({ message: 'Onboarding cancelled.', variant: 'success', duration: 4000 });
    },
    onError: () => {
      addToast({ message: 'Failed to cancel onboarding.', variant: 'danger', duration: 5000 });
    },
  });
}
