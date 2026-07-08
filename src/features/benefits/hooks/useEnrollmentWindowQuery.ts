// src/features/benefits/hooks/useEnrollmentWindowQuery.ts
// Sprint 10 — Enrollment Window Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { EnrollmentWindow } from "@/features/benefits/types/benefits.types";

export const enrollmentWindowKeys = {
  all: ["enrollment-window"] as const,
  active: () => [...enrollmentWindowKeys.all, "active"] as const,
};

async function fetchActiveEnrollmentWindow(): Promise<EnrollmentWindow | null> {
  const res = await apiClient.get<EnrollmentWindow | null>(
    "/api/v1/benefits/enrollment-window/active",
  );
  return res.data;
}

export function useEnrollmentWindowQuery() {
  return useQuery({
    queryKey: enrollmentWindowKeys.active(),
    queryFn: fetchActiveEnrollmentWindow,
  });
}
