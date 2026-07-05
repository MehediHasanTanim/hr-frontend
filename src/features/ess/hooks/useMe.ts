// src/features/ess/hooks/useMe.ts
// Sprint 6 — Enriched GET /auth/me hook for ESS

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { MeResponse } from "@/types/auth.types";

export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => apiClient.get<MeResponse>("/api/v1/auth/me").then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
}
