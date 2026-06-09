"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { Payslip } from "@/features/payroll/types";

export const payslipKeys = {
  all: ["payslips"] as const,
  list: (params?: Record<string, string>) => [...payslipKeys.all, "list", params] as const,
  detail: (id: string) => [...payslipKeys.all, "detail", id] as const,
};

export async function fetchPayslips(params?: Record<string, string>) {
  const response = await apiClient.get<Payslip[]>("/api/v1/payslips", { params });
  return response.data;
}

export async function fetchPayslip(id: string) {
  const response = await apiClient.get<Payslip>(`/api/v1/payslips/${id}`);
  return response.data;
}

export function usePayslips(params?: Record<string, string>) {
  return useQuery({
    queryKey: payslipKeys.list(params),
    queryFn: () => fetchPayslips(params),
    staleTime: 60_000,
  });
}

export function usePayslip(id: string) {
  return useQuery({
    queryKey: payslipKeys.detail(id),
    queryFn: () => fetchPayslip(id),
    enabled: Boolean(id),
    staleTime: 50 * 60 * 1000, // 50 min — refresh before signed URL expiry (1h)
  });
}
