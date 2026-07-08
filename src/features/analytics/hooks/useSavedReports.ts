// src/features/analytics/hooks/useSavedReports.ts
// Sprint 11 — All Report CRUD + Run hooks

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  SavedReport,
  ReportRun,
  ReportRunResult,
  CreateSavedReportDto,
} from "@/features/analytics/types/analytics";

export const reportKeys = {
  all: ["reports", "saved"] as const,
  list: () => [...reportKeys.all, "list"] as const,
  detail: (id: string) => [...reportKeys.all, "detail", id] as const,
  runs: (id: string) => [...reportKeys.all, "runs", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────
async function fetchSavedReports(): Promise<SavedReport[]> {
  const res = await apiClient.get<SavedReport[]>("/api/v1/reports/saved");
  return res.data;
}

export function useSavedReports() {
  return useQuery({
    queryKey: reportKeys.list(),
    queryFn: fetchSavedReports,
  });
}

async function fetchSavedReport(id: string): Promise<SavedReport> {
  const res = await apiClient.get<SavedReport>(`/api/v1/reports/saved/${id}`);
  return res.data;
}

export function useSavedReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => fetchSavedReport(id),
    enabled: !!id,
  });
}

async function fetchReportRunHistory(id: string): Promise<ReportRun[]> {
  const res = await apiClient.get<ReportRun[]>(`/api/v1/reports/saved/${id}/runs`);
  return res.data;
}

export function useReportRunHistory(id: string) {
  return useQuery({
    queryKey: reportKeys.runs(id),
    queryFn: () => fetchReportRunHistory(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────
async function createSavedReport(dto: CreateSavedReportDto): Promise<SavedReport> {
  const res = await apiClient.post<SavedReport>("/api/v1/reports/saved", dto);
  return res.data;
}

export function useCreateSavedReport() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: createSavedReport,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: reportKeys.list() });
      addToast({ message: `Report "${data.name}" saved.`, variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to save report.", variant: "danger", duration: 6000 });
    },
  });
}

async function updateSavedReport(id: string, dto: CreateSavedReportDto): Promise<SavedReport> {
  const res = await apiClient.patch<SavedReport>(`/api/v1/reports/saved/${id}`, dto);
  return res.data;
}

export function useUpdateSavedReport() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, ...dto }: CreateSavedReportDto & { id: string }) =>
      updateSavedReport(id, dto),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: reportKeys.list() });
      qc.invalidateQueries({ queryKey: reportKeys.detail(data.id) });
      addToast({ message: "Report updated.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to update report.", variant: "danger", duration: 6000 });
    },
  });
}

export function useDeleteSavedReport() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/reports/saved/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportKeys.list() });
      addToast({ message: "Report deleted.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to delete report.", variant: "danger", duration: 6000 });
    },
  });
}

async function runSavedReport(id: string): Promise<ReportRunResult> {
  const res = await apiClient.post<ReportRunResult>(`/api/v1/reports/saved/${id}/run`);
  return res.data;
}

export function useRunSavedReport() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: runSavedReport,
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: reportKeys.runs(id) });
      addToast({
        message: `Report ran: ${data.rowCount} rows${data.truncated ? " (truncated)" : ""}.`,
        variant: "success",
        duration: 4000,
      });
    },
    onError: () => {
      addToast({ message: "Failed to run report.", variant: "danger", duration: 6000 });
    },
  });
}
