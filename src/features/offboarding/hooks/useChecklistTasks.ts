// src/features/offboarding/hooks/useChecklistTasks.ts
// Sprint 11 — Offboarding Checklist Tasks + Exit Interview hooks

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  OffboardingChecklistTask,
  ExitInterview,
  CompleteChecklistTaskDto,
  SkipChecklistTaskDto,
  RecordExitInterviewDto,
} from "@/features/offboarding/types/offboarding";
import { exitRequestKeys } from "./useExitRequests";

export const checklistKeys = {
  byExitRequest: (exitRequestId: string) =>
    ["offboarding", "checklist-tasks", exitRequestId] as const,
};

export const interviewKeys = {
  byExitRequest: (exitRequestId: string) =>
    ["offboarding", "exit-interview", exitRequestId] as const,
};

// ─── Checklist Queries ────────────────────────────────────────
async function fetchChecklistTasks(
  exitRequestId: string,
): Promise<OffboardingChecklistTask[]> {
  const res = await apiClient.get<OffboardingChecklistTask[]>(
    `/api/v1/offboarding/exit-requests/${exitRequestId}/checklist`,
  );
  return res.data;
}

export function useChecklistTasks(exitRequestId: string) {
  return useQuery({
    queryKey: checklistKeys.byExitRequest(exitRequestId),
    queryFn: () => fetchChecklistTasks(exitRequestId),
    enabled: !!exitRequestId,
  });
}

// ─── Checklist Mutations ──────────────────────────────────────
export function useCompleteChecklistTask() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({
      taskId,
      exitRequestId,
      ...dto
    }: CompleteChecklistTaskDto & { taskId: string; exitRequestId: string }) =>
      apiClient.post(
        `/api/v1/offboarding/checklist-tasks/${taskId}/complete`,
        dto,
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: checklistKeys.byExitRequest(vars.exitRequestId),
      });
      qc.invalidateQueries({
        queryKey: exitRequestKeys.detail(vars.exitRequestId),
      });
      addToast({ message: "Task completed.", variant: "success", duration: 3000 });
    },
    onError: () => {
      addToast({ message: "Failed to complete task.", variant: "danger", duration: 6000 });
    },
  });
}

export function useSkipChecklistTask() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({
      taskId,
      exitRequestId,
      ...dto
    }: SkipChecklistTaskDto & { taskId: string; exitRequestId: string }) =>
      apiClient.post(`/api/v1/offboarding/checklist-tasks/${taskId}/skip`, dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: checklistKeys.byExitRequest(vars.exitRequestId),
      });
      qc.invalidateQueries({
        queryKey: exitRequestKeys.detail(vars.exitRequestId),
      });
      addToast({ message: "Task skipped.", variant: "success", duration: 3000 });
    },
    onError: () => {
      addToast({ message: "Failed to skip task.", variant: "danger", duration: 6000 });
    },
  });
}

// ─── Exit Interview ───────────────────────────────────────────
async function fetchExitInterview(exitRequestId: string): Promise<ExitInterview | null> {
  const res = await apiClient.get<ExitInterview | null>(
    `/api/v1/offboarding/exit-requests/${exitRequestId}/interview`,
  );
  return res.data;
}

export function useExitInterview(exitRequestId: string) {
  return useQuery({
    queryKey: interviewKeys.byExitRequest(exitRequestId),
    queryFn: () => fetchExitInterview(exitRequestId),
    enabled: !!exitRequestId,
  });
}

export function useCreateExitInterview() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (exitRequestId: string) =>
      apiClient.post<ExitInterview>(
        `/api/v1/offboarding/exit-requests/${exitRequestId}/interview`,
      ),
    onSuccess: (_, exitRequestId) => {
      qc.invalidateQueries({
        queryKey: interviewKeys.byExitRequest(exitRequestId),
      });
      addToast({ message: "Exit interview scheduled.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to schedule interview.", variant: "danger", duration: 6000 });
    },
  });
}

export function useUpdateExitInterview() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({
      exitRequestId,
      ...dto
    }: RecordExitInterviewDto & { exitRequestId: string }) =>
      apiClient.patch(
        `/api/v1/offboarding/exit-requests/${exitRequestId}/interview`,
        dto,
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: interviewKeys.byExitRequest(vars.exitRequestId),
      });
      qc.invalidateQueries({
        queryKey: exitRequestKeys.detail(vars.exitRequestId),
      });
      addToast({ message: "Exit interview recorded.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to record interview.", variant: "danger", duration: 6000 });
    },
  });
}
