"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { SalaryComponent } from "@/features/payroll/types";
import type { SalaryComponentFormValues } from "@/features/payroll/schemas/salary-component.schema";

export const componentKeys = {
  all: ["salary-components"] as const,
};

export async function fetchSalaryComponents() {
  const response = await apiClient.get<SalaryComponent[]>("/api/v1/salary-components");
  return response.data;
}

export async function createSalaryComponent(payload: SalaryComponentFormValues) {
  const response = await apiClient.post<SalaryComponent>("/api/v1/salary-components", payload);
  return response.data;
}

export async function updateSalaryComponent(id: string, payload: SalaryComponentFormValues) {
  const response = await apiClient.put<SalaryComponent>(`/api/v1/salary-components/${id}`, payload);
  return response.data;
}

export async function toggleSalaryComponentStatus(id: string) {
  const response = await apiClient.patch<SalaryComponent>(`/api/v1/salary-components/${id}/status`);
  return response.data;
}

export function useSalaryComponents() {
  return useQuery({
    queryKey: componentKeys.all,
    queryFn: fetchSalaryComponents,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSalaryComponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSalaryComponent,
    onSuccess: () => qc.invalidateQueries({ queryKey: componentKeys.all }),
  });
}

export function useUpdateSalaryComponent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalaryComponentFormValues) => updateSalaryComponent(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: componentKeys.all }),
  });
}

export function useToggleSalaryComponentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleSalaryComponentStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: componentKeys.all }),
  });
}
