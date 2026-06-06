"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  CreateHolidayCalendarPayload,
  CreateHolidayPayload,
  UpdateHolidayPayload,
} from "@/features/holiday/types";
import type { Holiday, HolidayCalendar } from "@/features/leave/types";

// ─── Keys ────────────────────────────────────────────────────────
export const holidayKeys = {
  all: ["holiday-calendars"] as const,
  list: (year?: number) =>
    [...holidayKeys.all, "list", { year }] as const,
  detail: (id: string) =>
    [...holidayKeys.all, "detail", id] as const,
  holidays: (calendarId: string) =>
    [...holidayKeys.all, "holidays", calendarId] as const,
};

// ─── API functions ───────────────────────────────────────────────
export async function fetchHolidayCalendars(year?: number) {
  const response = await apiClient.get<HolidayCalendar[]>(
    "/api/v1/holiday-calendars",
    { params: { year } },
  );
  return response.data;
}

export async function createHolidayCalendar(
  payload: CreateHolidayCalendarPayload,
) {
  const response = await apiClient.post<HolidayCalendar>(
    "/api/v1/holiday-calendars",
    payload,
  );
  return response.data;
}

export async function setDefaultCalendar(id: string) {
  const response = await apiClient.patch<HolidayCalendar>(
    `/api/v1/holiday-calendars/${id}/default`,
  );
  return response.data;
}

export async function fetchHolidays(calendarId: string) {
  const response = await apiClient.get<Holiday[]>(
    `/api/v1/holiday-calendars/${calendarId}/holidays`,
  );
  return response.data;
}

export async function createHoliday(
  calendarId: string,
  payload: CreateHolidayPayload,
) {
  const response = await apiClient.post<Holiday>(
    `/api/v1/holiday-calendars/${calendarId}/holidays`,
    payload,
  );
  return response.data;
}

export async function updateHoliday(id: string, payload: UpdateHolidayPayload) {
  const response = await apiClient.put<Holiday>(
    `/api/v1/holidays/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteHoliday(id: string) {
  await apiClient.delete(`/api/v1/holidays/${id}`);
}

// ─── React Query hooks ───────────────────────────────────────────

export function useHolidayCalendars(year?: number) {
  return useQuery({
    queryKey: holidayKeys.list(year),
    queryFn: () => fetchHolidayCalendars(year),
  });
}

export function useCreateHolidayCalendarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHolidayCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
  });
}

export function useSetDefaultCalendarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
  });
}

export function useHolidaysQuery(calendarId: string) {
  return useQuery({
    queryKey: holidayKeys.holidays(calendarId),
    queryFn: () => fetchHolidays(calendarId),
    enabled: Boolean(calendarId),
  });
}

export function useCreateHolidayMutation(calendarId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHolidayPayload) =>
      createHoliday(calendarId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: holidayKeys.holidays(calendarId),
      });
    },
  });
}

export function useUpdateHolidayMutation(calendarId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHolidayPayload }) =>
      updateHoliday(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: holidayKeys.holidays(calendarId),
      });
    },
  });
}

export function useDeleteHolidayMutation(calendarId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: holidayKeys.holidays(calendarId),
      });
    },
  });
}
