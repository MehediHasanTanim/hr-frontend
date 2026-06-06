"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  AttendanceCorrectionPayload,
  AttendanceException,
  AttendanceRecord,
} from "@/features/attendance/types";

// ─── Keys ────────────────────────────────────────────────────────
export const attendanceKeys = {
  all: ["attendance"] as const,
  list: (date: string, departmentId?: string) =>
    [...attendanceKeys.all, "list", { date, departmentId }] as const,
  exceptions: (params: {
    startDate: string;
    endDate: string;
    type?: string;
    employeeId?: string;
  }) => [...attendanceKeys.all, "exceptions", params] as const,
};

// ─── API functions ───────────────────────────────────────────────
export async function fetchAttendance(date: string, departmentId?: string) {
  const response = await apiClient.get<AttendanceRecord[]>(
    "/api/v1/attendance",
    { params: { date, departmentId } },
  );
  return response.data;
}

export async function fetchAttendanceExceptions(params: {
  startDate: string;
  endDate: string;
  type?: string;
  employeeId?: string;
}) {
  const response = await apiClient.get<AttendanceException[]>(
    "/api/v1/attendance/exceptions",
    { params },
  );
  return response.data;
}

export async function correctAttendance(
  id: string,
  payload: AttendanceCorrectionPayload,
) {
  const response = await apiClient.patch<AttendanceRecord>(
    `/api/v1/attendance/${id}/correct`,
    payload,
  );
  return response.data;
}

// ─── React Query hooks ───────────────────────────────────────────
export function useAttendanceQuery(date: string, departmentId?: string) {
  return useQuery({
    queryKey: attendanceKeys.list(date, departmentId),
    queryFn: () => fetchAttendance(date, departmentId),
    staleTime: 30 * 1000,
  });
}

export function useAttendanceExceptionsQuery(params: {
  startDate: string;
  endDate: string;
  type?: string;
  employeeId?: string;
}) {
  return useQuery({
    queryKey: attendanceKeys.exceptions(params),
    queryFn: () => fetchAttendanceExceptions(params),
    staleTime: 30 * 1000,
    enabled: Boolean(params.startDate && params.endDate),
  });
}

export function useCorrectAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AttendanceCorrectionPayload;
    }) => correctAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
