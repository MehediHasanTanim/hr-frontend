// src/features/recruitment/requisitions/api.ts
// Sprint 7 — Requisitions API hooks & query keys

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  JobRequisition,
  RequisitionFilters,
  CreateRequisitionDto,
  PaginatedResponse,
  RequisitionStatus,
} from "@/types/recruitment";

// ─── Keys ────────────────────────────────────────────────────────
export const requisitionKeys = {
  all: ['requisitions'] as const,
  list: (filters?: RequisitionFilters) =>
    [...requisitionKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...requisitionKeys.all, 'detail', id] as const,
};

// ─── API functions ───────────────────────────────────────────────
export async function fetchRequisitions(filters?: RequisitionFilters) {
  const res = await apiClient.get<PaginatedResponse<JobRequisition>>(
    '/api/v1/requisitions',
    { params: filters },
  );
  return res.data;
}

export async function fetchRequisition(id: string) {
  const res = await apiClient.get<JobRequisition>(`/api/v1/requisitions/${id}`);
  return res.data;
}

export async function createRequisition(dto: CreateRequisitionDto) {
  const res = await apiClient.post<JobRequisition>('/api/v1/requisitions', dto);
  return res.data;
}

export async function updateRequisitionStatus(id: string, status: RequisitionStatus) {
  const res = await apiClient.patch<JobRequisition>(
    `/api/v1/requisitions/${id}/status`,
    { status },
  );
  return res.data;
}

// ─── Hooks ────────────────────────────────────────────────────────
export function useRequisitions(filters?: RequisitionFilters) {
  return useQuery({
    queryKey: requisitionKeys.list(filters),
    queryFn: () => fetchRequisitions(filters),
    staleTime: 60 * 1000,
  });
}

export function useRequisition(id: string) {
  return useQuery({
    queryKey: requisitionKeys.detail(id),
    queryFn: () => fetchRequisition(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: createRequisition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requisitionKeys.all });
      addToast({ message: 'Requisition created.', variant: 'success', duration: 4000 });
    },
    onError: () => {
      addToast({ message: 'Failed to create requisition.', variant: 'danger', duration: 5000 });
    },
  });
}

export function useUpdateRequisitionStatus() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequisitionStatus }) =>
      updateRequisitionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requisitionKeys.all });
      addToast({ message: 'Requisition status updated.', variant: 'success', duration: 3000 });
    },
    onError: () => {
      addToast({ message: 'Failed to update status.', variant: 'danger', duration: 5000 });
    },
  });
}
