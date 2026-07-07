// src/features/performance/api/pips.ts
// Sprint 8 F5 — PIP Management API hooks

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { PerformanceImprovementPlan, PipCheckIn } from "@/types/performance";

export const pipKeys = {
  all: ['performance', 'pips'] as const,
  detail: (id: string) => [...pipKeys.all, 'detail', id] as const,
  byEmployee: (employeeId: string) => [...pipKeys.all, 'employee', employeeId] as const,
};

async function fetchPip(id: string) {
  const res = await apiClient.get<PerformanceImprovementPlan>(`/api/v1/performance/pips/${id}`);
  return res.data;
}

async function fetchEmployeePips(employeeId: string) {
  const res = await apiClient.get<PerformanceImprovementPlan[]>(`/api/v1/performance/employees/${employeeId}/pips`);
  return res.data;
}

export function usePip(id: string) {
  return useQuery({
    queryKey: pipKeys.detail(id),
    queryFn: () => fetchPip(id),
    enabled: !!id,
  });
}

export function useEmployeePips(employeeId: string) {
  return useQuery({
    queryKey: pipKeys.byEmployee(employeeId),
    queryFn: () => fetchEmployeePips(employeeId),
    enabled: !!employeeId,
  });
}

export function useInitiatePip() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: { employeeId: string; reason: string; goals: string; startDate: string; endDate: string }) =>
      apiClient.post('/api/v1/performance/pips', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipKeys.all });
      addToast({ message: 'PIP initiated.', variant: 'success', duration: 4000 });
    },
    onError: () => addToast({ message: 'Failed to initiate PIP.', variant: 'danger', duration: 5000 }),
  });
}

export function useAddPipCheckIn() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ pipId, ...dto }: { pipId: string; note: string; ratingAtCheckIn?: string }) =>
      apiClient.post(`/api/v1/performance/pips/${pipId}/check-ins`, dto).then((r) => r.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: pipKeys.detail(vars.pipId) });
      addToast({ message: 'Check-in added.', variant: 'success', duration: 3000 });
    },
  });
}

export function useClosePip() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ pipId, outcome, outcomeNotes }: { pipId: string; outcome: string; outcomeNotes: string }) =>
      apiClient.patch(`/api/v1/performance/pips/${pipId}/close`, { outcome, outcomeNotes }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipKeys.all });
      addToast({ message: 'PIP closed.', variant: 'success', duration: 4000 });
    },
    onError: () => addToast({ message: 'Failed to close PIP.', variant: 'danger', duration: 5000 }),
  });
}
