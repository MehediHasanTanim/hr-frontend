"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { PayrollCycle, PayrollEntry, PayrollEntryComponent } from "@/features/payroll/types";

export const cycleKeys = {
  all: ["payroll-cycles"] as const,
  list: (page?: number) => [...cycleKeys.all, "list", { page }] as const,
  detail: (id: string) => [...cycleKeys.all, "detail", id] as const,
  entries: (id: string) => [...cycleKeys.all, "entries", id] as const,
  entryComponents: (entryId: string) => ["entry-components", entryId] as const,
};

export async function fetchPayrollCycles(page = 1, pageSize = 20) {
  const response = await apiClient.get<{ data: PayrollCycle[]; total: number }>(
    "/api/v1/payroll/cycles",
    { params: { page, pageSize } },
  );
  return response.data;
}

export async function fetchPayrollCycle(id: string) {
  const response = await apiClient.get<PayrollCycle>(`/api/v1/payroll/cycles/${id}`);
  return response.data;
}

export async function fetchPayrollEntries(cycleId: string) {
  const response = await apiClient.get<PayrollEntry[]>(
    `/api/v1/payroll/cycles/${cycleId}/entries`,
  );
  return response.data;
}

export async function fetchEntryComponents(entryId: string) {
  const response = await apiClient.get<PayrollEntryComponent[]>(
    `/api/v1/payroll/entries/${entryId}/components`,
  );
  return response.data;
}

export async function createPayrollCycle(payload: { month: number; year: number }) {
  const response = await apiClient.post<PayrollCycle>("/api/v1/payroll/cycles", payload);
  return response.data;
}

export async function runPayrollCycle(id: string) {
  const response = await apiClient.post<PayrollCycle>(`/api/v1/payroll/cycles/${id}/run`);
  return response.data;
}

export async function approvePayrollCycle(id: string) {
  const response = await apiClient.post<PayrollCycle>(`/api/v1/payroll/cycles/${id}/approve`);
  return response.data;
}

export async function reversePayrollCycle(id: string, reversalReason: string) {
  const response = await apiClient.post<PayrollCycle>(
    `/api/v1/payroll/cycles/${id}/reverse`,
    { reversalReason },
  );
  return response.data;
}

export async function disbursePayrollCycle(id: string) {
  const response = await apiClient.post<PayrollCycle>(`/api/v1/payroll/cycles/${id}/disburse`);
  return response.data;
}

export function usePayrollCycles(page = 1) {
  return useQuery({
    queryKey: cycleKeys.list(page),
    queryFn: () => fetchPayrollCycles(page),
    staleTime: 60_000,
  });
}

export function usePayrollCycle(id: string) {
  return useQuery({
    queryKey: cycleKeys.detail(id),
    queryFn: () => fetchPayrollCycle(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "processing" ? 5000 : false;
    },
  });
}

export function usePayrollEntries(cycleId: string) {
  return useQuery({
    queryKey: cycleKeys.entries(cycleId),
    queryFn: () => fetchPayrollEntries(cycleId),
    enabled: Boolean(cycleId),
  });
}

export function useEntryComponents(entryId: string) {
  return useQuery({
    queryKey: cycleKeys.entryComponents(entryId),
    queryFn: () => fetchEntryComponents(entryId),
    enabled: Boolean(entryId),
  });
}

export function useCreatePayrollCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPayrollCycle,
    onSuccess: () => qc.invalidateQueries({ queryKey: cycleKeys.all }),
  });
}

export function useRunPayrollCycle(cycleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => runPayrollCycle(cycleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) }),
  });
}

export function useApprovePayrollCycle(cycleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => approvePayrollCycle(cycleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) });
      qc.invalidateQueries({ queryKey: cycleKeys.entries(cycleId) });
    },
  });
}

export function useReversePayrollCycle(cycleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reversalReason }: { reversalReason: string }) =>
      reversePayrollCycle(cycleId, reversalReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) });
      qc.invalidateQueries({ queryKey: cycleKeys.entries(cycleId) });
    },
  });
}

export function useDisbursePayrollCycle(cycleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => disbursePayrollCycle(cycleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cycleKeys.detail(cycleId) });
      qc.invalidateQueries({ queryKey: cycleKeys.entries(cycleId) });
    },
  });
}
