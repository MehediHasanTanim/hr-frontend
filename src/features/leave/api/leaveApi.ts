"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  CreateLeaveRequestPayload,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestListQuery,
  LeaveRequestListResponse,
  LeaveType,
} from "@/features/leave/types";

// ─── Keys ────────────────────────────────────────────────────────
export const leaveKeys = {
  all: ["leave"] as const,
  leaveTypes: () => [...leaveKeys.all, "leave-types"] as const,
  leaveBalances: (year: number) =>
    [...leaveKeys.all, "leave-balance", { year }] as const,
  leaveRequests: (query?: LeaveRequestListQuery) =>
    [...leaveKeys.all, "leave-requests", query] as const,
  leaveCalendar: (params: {
    year: number;
    month: number;
    departmentId?: string;
  }) => [...leaveKeys.all, "calendar", params] as const,
};

// ─── API functions ───────────────────────────────────────────────
export async function fetchLeaveTypes() {
  const response = await apiClient.get<LeaveType[]>("/api/v1/leave-types");
  return response.data;
}

export async function fetchLeaveBalances(year: number) {
  const response = await apiClient.get<LeaveBalance[]>(
    "/api/v1/leave/balance",
    { params: { year } },
  );
  return response.data;
}

export async function createLeaveRequest(payload: CreateLeaveRequestPayload) {
  const response = await apiClient.post<LeaveRequest>(
    "/api/v1/leave/requests",
    payload,
  );
  return response.data;
}

export async function fetchLeaveRequests(query: LeaveRequestListQuery) {
  const response = await apiClient.get<LeaveRequestListResponse>(
    "/api/v1/leave/requests",
    { params: query },
  );
  return response.data;
}

export async function approveLeaveRequest(id: string) {
  const response = await apiClient.patch<LeaveRequest>(
    `/api/v1/leave/requests/${id}/approve`,
  );
  return response.data;
}

export async function rejectLeaveRequest(
  id: string,
  rejectionReason: string,
) {
  const response = await apiClient.patch<LeaveRequest>(
    `/api/v1/leave/requests/${id}/reject`,
    { rejectionReason },
  );
  return response.data;
}

export async function fetchLeaveCalendar(params: {
  startDate: string;
  endDate: string;
  departmentId?: string;
}) {
  const response = await apiClient.get("/api/v1/leave/calendar", {
    params,
  });
  return response.data;
}

// ─── React Query hooks ───────────────────────────────────────────
export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.leaveTypes(),
    queryFn: fetchLeaveTypes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaveBalances(year: number) {
  return useQuery({
    queryKey: leaveKeys.leaveBalances(year),
    queryFn: () => fetchLeaveBalances(year),
    staleTime: 60 * 1000,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.leaveRequests() });
      queryClient.invalidateQueries({ queryKey: [...leaveKeys.all, "leave-balance"] });
    },
  });
}

export function useLeaveRequests(query: LeaveRequestListQuery) {
  return useQuery({
    queryKey: leaveKeys.leaveRequests(query),
    queryFn: () => fetchLeaveRequests(query),
    placeholderData: (previousData) => previousData,
    refetchInterval: query.status === "pending" ? 60_000 : false,
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveLeaveRequest,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: leaveKeys.all });
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (_err, _vars, context) => {
      if (context?.id) {
        queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      }
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      rejectLeaveRequest(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (_err, _vars, context) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useLeaveCalendar(params: {
  year: number;
  month: number;
  departmentId?: string;
}) {
  const startDate = `${params.year}-${String(params.month).padStart(2, "0")}-01`;
  const end = new Date(params.year, params.month, 0);
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  return useQuery({
    queryKey: leaveKeys.leaveCalendar(params),
    queryFn: () =>
      fetchLeaveCalendar({
        startDate,
        endDate,
        departmentId: params.departmentId,
      }),
    staleTime: 60 * 1000,
  });
}
