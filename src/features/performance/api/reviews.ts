// src/features/performance/api/reviews.ts
// Sprint 8 F3/F4 — Performance Reviews & Calibration API hooks

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { PerformanceReview, CalibrationRow, ReviewResponse } from "@/types/performance";

export const reviewKeys = {
  all: ['performance', 'reviews'] as const,
  detail: (id: string) => [...reviewKeys.all, 'detail', id] as const,
  cycle: (cycleId: string) => [...reviewKeys.all, 'cycle', cycleId] as const,
};

async function fetchReview(id: string) {
  const res = await apiClient.get<PerformanceReview>(`/api/v1/performance/reviews/${id}`);
  return res.data;
}

async function fetchCycleReviews(cycleId: string) {
  const res = await apiClient.get<CalibrationRow[]>(`/api/v1/performance/cycles/${cycleId}/reviews`);
  return res.data;
}

async function saveResponse(reviewId: string, dto: ReviewResponse) {
  const res = await apiClient.patch(`/api/v1/performance/reviews/${reviewId}/responses`, dto);
  return res.data;
}

async function submitReview(reviewId: string, role: 'self' | 'manager') {
  const res = await apiClient.post(`/api/v1/performance/reviews/${reviewId}/submit`, { role });
  return res.data;
}

async function acknowledgeReview(reviewId: string) {
  const res = await apiClient.post(`/api/v1/performance/reviews/${reviewId}/acknowledge`);
  return res.data;
}

async function applyCalibration(reviewId: string, dto: { calibratedRating: string; justification: string }) {
  const res = await apiClient.patch(
    `/api/v1/performance/reviews/${reviewId}/calibrate`,
    dto,
  );
  return res.data;
}

export function usePerformanceReview(id: string) {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => fetchReview(id),
    enabled: !!id,
  });
}

export function useCycleReviews(cycleId: string) {
  return useQuery({
    queryKey: reviewKeys.cycle(cycleId),
    queryFn: () => fetchCycleReviews(cycleId),
    enabled: !!cycleId,
  });
}

export function useSaveReviewResponse() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ reviewId, ...dto }: { reviewId: string } & ReviewResponse) =>
      saveResponse(reviewId, dto),
    onError: () => addToast({ message: 'Draft not saved. Retrying...', variant: 'warning', duration: 3000 }),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(vars.reviewId) });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ reviewId, role }: { reviewId: string; role: 'self' | 'manager' }) =>
      submitReview(reviewId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      addToast({ message: 'Review submitted.', variant: 'success', duration: 4000 });
    },
    onError: () => addToast({ message: 'Failed to submit review.', variant: 'danger', duration: 5000 }),
  });
}

export function useAcknowledgeReview() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (reviewId: string) => acknowledgeReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      addToast({ message: 'Review acknowledged.', variant: 'success', duration: 4000 });
    },
    onError: () => addToast({ message: 'Failed to acknowledge.', variant: 'danger', duration: 5000 }),
  });
}

export function useApplyCalibrationOverride() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ reviewId, ...dto }: { reviewId: string; calibratedRating: string; justification: string }) =>
      applyCalibration(reviewId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      addToast({ message: 'Calibration override applied.', variant: 'success', duration: 4000 });
    },
    onError: () => addToast({ message: 'Failed to apply override.', variant: 'danger', duration: 5000 }),
  });
}
