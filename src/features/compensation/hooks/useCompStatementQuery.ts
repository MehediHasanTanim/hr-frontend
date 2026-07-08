// src/features/compensation/hooks/useCompStatementQuery.ts
// Sprint 10 — Compensation Statement Query Hook

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CompStatement } from "@/features/compensation/types/compensation.types";

export const compStatementKeys = {
  all: ["comp-statement"] as const,
  byEmployee: (employeeId: string) =>
    [...compStatementKeys.all, employeeId] as const,
};

async function fetchCompStatement(
  employeeId: string,
): Promise<CompStatement> {
  const res = await apiClient.get<CompStatement>(
    `/api/v1/compensation/statement/${employeeId}`,
  );
  return res.data;
}

export function useCompStatementQuery(employeeId: string) {
  return useQuery({
    queryKey: compStatementKeys.byEmployee(employeeId),
    queryFn: () => fetchCompStatement(employeeId),
    enabled: !!employeeId,
  });
}
