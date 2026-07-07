// src/features/performance/api/okr.ts
// Sprint 8 F2 — OKR/Goals API hooks

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { Goal, GoalCheckIn } from "@/types/performance";

export const okrKeys = {
  all: ['performance', 'goals'] as const,
  tree: (employeeId: string, cycleId?: string) =>
    [...okrKeys.all, 'tree', employeeId, cycleId ?? 'all'] as const,
  checkIns: (goalId: string) => [...okrKeys.all, 'checkIns', goalId] as const,
};

async function fetchOkrTree(employeeId: string, cycleId?: string) {
  const res = await apiClient.get<Goal[]>('/api/v1/performance/goals/tree', {
    params: { employeeId, cycleId },
  });
  return res.data;
}

async function fetchCheckIns(goalId: string) {
  const res = await apiClient.get<GoalCheckIn[]>(`/api/v1/performance/goals/${goalId}/check-ins`);
  return res.data;
}

async function createGoal(dto: Partial<Goal>) {
  const res = await apiClient.post<Goal>('/api/v1/performance/goals', dto);
  return res.data;
}

async function updateGoal(id: string, dto: Partial<Goal>) {
  const res = await apiClient.patch<Goal>(`/api/v1/performance/goals/${id}`, dto);
  return res.data;
}

async function postCheckIn(goalId: string, dto: { note: string; value?: number }) {
  const res = await apiClient.post<GoalCheckIn>(
    `/api/v1/performance/goals/${goalId}/check-ins`,
    dto,
  );
  return res.data;
}

export function useOkrTree(employeeId: string, cycleId?: string) {
  return useQuery({
    queryKey: okrKeys.tree(employeeId, cycleId),
    queryFn: () => fetchOkrTree(employeeId, cycleId),
    enabled: !!employeeId,
    staleTime: 60 * 1000,
  });
}

export function useGoalCheckIns(goalId: string) {
  return useQuery({
    queryKey: okrKeys.checkIns(goalId),
    queryFn: () => fetchCheckIns(goalId),
    enabled: !!goalId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      addToast({ message: 'Goal created.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to create goal.', variant: 'danger', duration: 5000 }),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Partial<Goal>) => updateGoal(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      addToast({ message: 'Goal updated.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to update goal.', variant: 'danger', duration: 5000 }),
  });
}

export function usePostCheckIn() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ goalId, ...dto }: { goalId: string; note: string; value?: number }) =>
      postCheckIn(goalId, dto),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: okrKeys.checkIns(vars.goalId) });
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      addToast({ message: 'Check-in posted.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to post check-in.', variant: 'danger', duration: 5000 }),
  });
}
