// src/features/mss/hooks/useTeamLeaveRequests.ts
// Sprint 6 — MSS team leave requests hook

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { TeamLeaveResponse, TeamLeaveFilters } from "@/types/mss.types";
import { useToastStore } from "@/stores/toast.store";

export function useTeamLeaveRequests(filters: TeamLeaveFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.TEAM_LEAVE_REQUESTS(filters as Record<string, unknown>),
    queryFn: () =>
      apiClient
        .get<TeamLeaveResponse>("/api/v1/leave/requests/team", { params: filters })
        .then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      apiClient.patch(`/api/v1/leave/requests/${id}/approve`, { remarks }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM_LEAVE_REQUESTS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
      addToast({ message: "Leave request approved.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to approve leave request.", variant: "danger", duration: 5000 });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.patch(`/api/v1/leave/requests/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM_LEAVE_REQUESTS() });
      addToast({ message: "Leave request rejected.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to reject leave request.", variant: "danger", duration: 5000 });
    },
  });
}
