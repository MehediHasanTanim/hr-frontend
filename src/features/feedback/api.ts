// src/features/feedback/api.ts
// Sprint 8 F6 — Continuous Feedback & 1:1 Meetings API hooks

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { Feedback, OneOnOneMeeting } from "@/types/feedback";

export const feedbackKeys = {
  all: ['feedback'] as const,
  received: (employeeId: string) => [...feedbackKeys.all, 'received', employeeId] as const,
  given: (employeeId: string) => [...feedbackKeys.all, 'given', employeeId] as const,
  meetings: (employeeId: string) => [...feedbackKeys.all, 'meetings', employeeId] as const,
};

async function giveFeedback(dto: { receivedBy: string; visibility: string; category: string; message: string }) {
  const res = await apiClient.post<Feedback>('/api/v1/feedback', dto);
  return res.data;
}

async function fetchReceivedFeedback(employeeId: string) {
  const res = await apiClient.get<Feedback[]>(`/api/v1/feedback/received/${employeeId}`);
  return res.data;
}

async function fetchGivenFeedback(employeeId: string) {
  const res = await apiClient.get<Feedback[]>(`/api/v1/feedback/given/${employeeId}`);
  return res.data;
}

export function useGiveFeedback() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: giveFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      addToast({ message: 'Feedback sent.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to send feedback.', variant: 'danger', duration: 5000 }),
  });
}

export function useReceivedFeedback(employeeId: string) {
  return useQuery({
    queryKey: feedbackKeys.received(employeeId),
    queryFn: () => fetchReceivedFeedback(employeeId),
    enabled: !!employeeId,
  });
}

export function useGivenFeedback(employeeId: string) {
  return useQuery({
    queryKey: feedbackKeys.given(employeeId),
    queryFn: () => fetchGivenFeedback(employeeId),
    enabled: !!employeeId,
  });
}

export function useOneOnOneMeetings(employeeId: string) {
  return useQuery({
    queryKey: feedbackKeys.meetings(employeeId),
    queryFn: () =>
      apiClient.get<OneOnOneMeeting[]>(`/api/v1/meetings/${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: { employeeId: string; meetingDate: string; notes: string }) =>
      apiClient.post('/api/v1/meetings', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      addToast({ message: 'Meeting created.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to create meeting.', variant: 'danger', duration: 5000 }),
  });
}
