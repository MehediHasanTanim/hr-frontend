// src/features/reports/hooks/useTriggerExport.ts
// Sprint 6 — Trigger export mutation hook

"use client";

import { useMutation } from "@tanstack/react-query";
import { reportsApi } from "../api/reports.api";
import type { ExportFormat } from "@/types/report.types";
import { useToastStore } from "@/stores/toast.store";

export function useTriggerExport() {
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: ExportFormat }) =>
      reportsApi.triggerExport(id, format),
    onSuccess: ({ jobId }) => {
      addToast({
        message: `Export queued. You'll be notified when ready. (Job: ${jobId})`,
        variant: "success",
        duration: 5000,
      });
    },
    onError: () => {
      addToast({
        message: "Failed to queue export. Please try again.",
        variant: "danger",
        duration: 5000,
      });
    },
  });
}
