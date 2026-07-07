// src/features/lms/player/api.ts
// Sprint 9 F2 — Course Player API hooks

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { CourseEnrollment } from "@/types/lms";

export const enrollmentKeys = {
  all: ['lms', 'enrollments'] as const,
  detail: (id: string) => [...enrollmentKeys.all, 'detail', id] as const,
};

export function useEnrollmentQuery(enrollmentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(enrollmentId),
    queryFn: () =>
      apiClient.get<CourseEnrollment>(`/api/v1/lms/enrollments/${enrollmentId}`).then((r) => r.data),
    enabled: !!enrollmentId,
    staleTime: 10 * 1000,
  });
}

export function useUpdateProgressMutation(enrollmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressPercent: number) =>
      apiClient.patch(`/api/v1/lms/enrollments/${enrollmentId}/progress`, { progressPercent }).then((r) => r.data),
    onMutate: async (progressPercent) => {
      await queryClient.cancelQueries({ queryKey: enrollmentKeys.detail(enrollmentId) });
      const previous = queryClient.getQueryData<CourseEnrollment>(enrollmentKeys.detail(enrollmentId));
      queryClient.setQueryData<CourseEnrollment>(enrollmentKeys.detail(enrollmentId), (old) =>
        old ? { ...old, progressPercent, status: progressPercent > 0 ? 'in_progress' : old.status } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(enrollmentKeys.detail(enrollmentId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(enrollmentId) });
    },
  });
}

export function useCompleteCourseMutation(enrollmentId: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/lms/enrollments/${enrollmentId}/complete`).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(enrollmentKeys.detail(enrollmentId), data);
      queryClient.invalidateQueries({ queryKey: ['lms', 'my-training'] });
      queryClient.invalidateQueries({ queryKey: ['lms', 'learning-paths'] });
      addToast({ message: 'Course completed!', variant: 'success', duration: 4000 });
    },
    // Backend treats double-complete as idempotent no-op — don't surface error
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) return; // already completed — idempotent, not an error
      addToast({ message: 'Failed to complete course.', variant: 'danger', duration: 5000 });
    },
  });
}

export function useCertificateUrlQuery(enrollmentId: string) {
  return useQuery({
    queryKey: [...enrollmentKeys.detail(enrollmentId), 'certificate'],
    queryFn: () =>
      apiClient.get<{ url: string }>(`/api/v1/lms/enrollments/${enrollmentId}/certificate`).then((r) => r.data),
    enabled: false, // only fetch on click — not prefetched
    staleTime: 0,
    gcTime: 0, // don't cache signed URLs
  });
}
