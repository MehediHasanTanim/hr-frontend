// src/features/lms/courses/api.ts
// Sprint 9 F1 — Course Catalog API hooks

"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { Course, CourseListFilters, PaginatedResponse } from "@/types/lms";

export const courseKeys = {
  all: ['lms', 'courses'] as const,
  list: (filters: CourseListFilters) => [...courseKeys.all, 'list', filters] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
};

export function useCoursesQuery(filters: CourseListFilters) {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Course>>('/api/v1/lms/courses', { params: filters }).then((r) => r.data),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCourseQuery(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => apiClient.get<Course>(`/api/v1/lms/courses/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useEnrollMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (courseId: string) =>
      apiClient.post(`/api/v1/lms/courses/${courseId}/enroll`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms'] });
      addToast({ message: 'Enrolled successfully.', variant: 'success', duration: 3000 });
    },
    onError: () => addToast({ message: 'Failed to enroll.', variant: 'danger', duration: 5000 }),
  });
}
