// src/features/analytics/hooks/usePayrollTrends.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PayrollTrend } from "@/features/analytics/types/analytics";

async function fetchPayrollTrends(months: number): Promise<PayrollTrend[]> {
  const res = await apiClient.get<PayrollTrend[]>(
    "/api/v1/analytics/dashboard/payroll-trends",
    { params: { months } },
  );
  return res.data;
}

export function usePayrollTrends(months: number = 12) {
  return useQuery({
    queryKey: ["analytics", "dashboard", "payroll-trends", months],
    queryFn: () => fetchPayrollTrends(months),
    staleTime: 5 * 60 * 1000,
  });
}
