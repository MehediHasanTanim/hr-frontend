// src/features/benefits/hooks/useMyEnrollmentsQuery.ts
// Sprint 10 — My Enrollments Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MyEnrollment } from "@/features/benefits/types/benefits.types";

async function fetchMyEnrollments(): Promise<MyEnrollment[]> {
  const res = await apiClient.get<MyEnrollment[]>(
    "/api/v1/benefits/enrollments/my",
  );
  return res.data;
}

export function useMyEnrollmentsQuery() {
  return useQuery({
    queryKey: ["my-enrollments", "list"],
    queryFn: fetchMyEnrollments,
  });
}
