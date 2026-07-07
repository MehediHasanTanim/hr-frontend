// src/features/recruitment/applications/api.ts
// Sprint 7 — Applications API hooks & query keys

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  Application,
  ApplicationFilters,
  MoveStageDto,
  RejectApplicationDto,
  PaginatedResponse,
} from "@/types/recruitment";
import type { ApplicationStage } from "@/types/recruitment";

// ─── Keys ────────────────────────────────────────────────────────
export const applicationKeys = {
  all: ['applications'] as const,
  list: (filters: ApplicationFilters) =>
    [...applicationKeys.all, 'list', filters] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
  byRequisition: (requisitionId: string) =>
    [...applicationKeys.all, 'byRequisition', requisitionId] as const,
};

// ─── API functions ───────────────────────────────────────────────
export async function fetchApplications(filters: ApplicationFilters) {
  const res = await apiClient.get<PaginatedResponse<Application>>(
    '/api/v1/applications',
    { params: filters },
  );
  return res.data;
}

export async function fetchApplication(id: string) {
  const res = await apiClient.get<Application>(`/api/v1/applications/${id}`);
  return res.data;
}

export async function moveApplicationStage(
  id: string,
  dto: MoveStageDto,
): Promise<Application> {
  const res = await apiClient.patch<Application>(
    `/api/v1/applications/${id}/stage`,
    dto,
  );
  return res.data;
}

export async function rejectApplication(
  id: string,
  dto: RejectApplicationDto,
): Promise<Application> {
  const res = await apiClient.patch<Application>(
    `/api/v1/applications/${id}/reject`,
    dto,
  );
  return res.data;
}

// ─── Hooks ────────────────────────────────────────────────────────
export function useApplications(filters: ApplicationFilters) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => fetchApplications(filters),
    staleTime: 30 * 1000,
    enabled: !!filters.requisitionId,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  });
}

export function useMoveApplicationStage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: ApplicationStage; notes?: string }) =>
      moveApplicationStage(id, { stage, notes }),
    onMutate: async ({ id, stage }) => {
      // Cancel outgoing queries so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: applicationKeys.all });

      // Snapshot previous state for rollback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- needed for optimistic rollback
      const prev = queryClient.getQueriesData<any>({
        queryKey: applicationKeys.all,
      });

      // Optimistically update all application list caches
      queryClient.setQueriesData(
        { queryKey: applicationKeys.all, type: 'active' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: any) => {
          if (!old?.data) return old;
          // PaginatedResponse<Application>
          const data = Array.isArray(old.data) ? old.data : old.data.data;
          const updated = data.map((app: Application) =>
            app.id === id ? { ...app, stage, lastStageMovedAt: new Date().toISOString() } : app,
          );
          return {
            ...old,
            data: Array.isArray(old.data) ? updated : { ...old.data, data: updated },
          };
        },
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      // Rollback all caches
      if (context?.prev) {
        for (const [queryKey, data] of context.prev) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      addToast({
        message: 'Failed to move application. It may be an invalid stage transition.',
        variant: 'danger',
        duration: 5000,
      });
    },
    onSuccess: () => {
      addToast({
        message: 'Application moved successfully.',
        variant: 'success',
        duration: 3000,
      });
    },
    onSettled: () => {
      // Re-fetch to reconcile with server state
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectApplication(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      addToast({ message: 'Application rejected.', variant: 'success', duration: 3000 });
    },
    onError: () => {
      addToast({ message: 'Failed to reject application.', variant: 'danger', duration: 5000 });
    },
  });
}
