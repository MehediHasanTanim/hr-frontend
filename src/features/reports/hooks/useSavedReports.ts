// src/features/reports/hooks/useSavedReports.ts
// Sprint 6 — Saved reports hooks

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { reportsApi } from "../api/reports.api";
import type { SaveReportDto } from "@/types/report.types";
import { useToastStore } from "@/stores/toast.store";

export function useSavedReports() {
  return useQuery({
    queryKey: QUERY_KEYS.SAVED_REPORTS,
    queryFn: reportsApi.listSaved,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSaveReport() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: SaveReportDto) => reportsApi.saveReport(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_REPORTS });
      addToast({ message: "Report saved successfully.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to save report.", variant: "danger", duration: 5000 });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) => reportsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_REPORTS });
      addToast({ message: "Report deleted.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to delete report.", variant: "danger", duration: 5000 });
    },
  });
}
