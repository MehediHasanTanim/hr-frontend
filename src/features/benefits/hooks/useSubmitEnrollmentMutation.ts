// src/features/benefits/hooks/useSubmitEnrollmentMutation.ts
// Sprint 10 — Submit Enrollment Mutation Hook

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { SubmitEnrollmentDto, MyEnrollment } from "@/features/benefits/types/benefits.types";
import { enrollmentWindowKeys } from "./useEnrollmentWindowQuery";

export const myEnrollmentKeys = {
  all: ["my-enrollments"] as const,
  list: () => [...myEnrollmentKeys.all, "list"] as const,
};

async function submitEnrollment(
  dto: SubmitEnrollmentDto,
): Promise<MyEnrollment> {
  const res = await apiClient.post<MyEnrollment>(
    "/api/v1/benefits/enrollments",
    dto,
  );
  return res.data;
}

export function useSubmitEnrollmentMutation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: submitEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myEnrollmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: enrollmentWindowKeys.active(),
      });
    },
    onError: () => {
      addToast({
        message:
          "Unable to submit enrollment. Please verify your details and try again.",
        variant: "danger",
        duration: 6_000,
      });
    },
  });
}
