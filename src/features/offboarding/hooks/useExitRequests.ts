// src/features/offboarding/hooks/useExitRequests.ts
// Sprint 11 — Exit Requests CRUD hooks

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  ExitRequest,
  CreateExitRequestDto,
  RejectExitRequestDto,
} from "@/features/offboarding/types/offboarding";

export const exitRequestKeys = {
  all: ["offboarding", "exit-requests"] as const,
  list: () => [...exitRequestKeys.all, "list"] as const,
  detail: (id: string) => [...exitRequestKeys.all, "detail", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────
async function fetchExitRequests(): Promise<ExitRequest[]> {
  const res = await apiClient.get<ExitRequest[]>("/api/v1/offboarding/exit-requests");
  return res.data;
}

export function useExitRequests() {
  return useQuery({
    queryKey: exitRequestKeys.list(),
    queryFn: fetchExitRequests,
  });
}

async function fetchExitRequest(id: string): Promise<ExitRequest> {
  const res = await apiClient.get<ExitRequest>(`/api/v1/offboarding/exit-requests/${id}`);
  return res.data;
}

export function useExitRequest(id: string) {
  return useQuery({
    queryKey: exitRequestKeys.detail(id),
    queryFn: () => fetchExitRequest(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────
async function createExitRequest(dto: CreateExitRequestDto): Promise<ExitRequest> {
  const res = await apiClient.post<ExitRequest>("/api/v1/offboarding/exit-requests", dto);
  return res.data;
}

export function useCreateExitRequest() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: createExitRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exitRequestKeys.list() });
      addToast({ message: "Exit request submitted.", variant: "success", duration: 5000 });
    },
    onError: () => {
      addToast({ message: "Failed to submit exit request.", variant: "danger", duration: 6000 });
    },
  });
}

export function useApproveExitRequest() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/api/v1/offboarding/exit-requests/${id}/approve`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: exitRequestKeys.list() });
      qc.invalidateQueries({ queryKey: exitRequestKeys.detail(id) });
      addToast({ message: "Exit request approved.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to approve exit request.", variant: "danger", duration: 6000 });
    },
  });
}

export function useRejectExitRequest() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, ...dto }: RejectExitRequestDto & { id: string }) =>
      apiClient.post(`/api/v1/offboarding/exit-requests/${id}/reject`, dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: exitRequestKeys.list() });
      qc.invalidateQueries({ queryKey: exitRequestKeys.detail(vars.id) });
      addToast({ message: "Exit request rejected.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to reject exit request.", variant: "danger", duration: 6000 });
    },
  });
}

export function useCancelExitRequest() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/api/v1/offboarding/exit-requests/${id}/cancel`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: exitRequestKeys.list() });
      qc.invalidateQueries({ queryKey: exitRequestKeys.detail(id) });
      addToast({ message: "Exit request cancelled.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to cancel exit request.", variant: "danger", duration: 6000 });
    },
  });
}
