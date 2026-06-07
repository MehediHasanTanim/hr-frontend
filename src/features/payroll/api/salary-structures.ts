"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { SalaryStructure } from "@/features/payroll/types";
import type { SalaryStructureFormValues } from "@/features/payroll/schemas/salary-structure.schema";

export const structureKeys = {
  all: ["salary-structures"] as const,
  detail: (id: string) => [...structureKeys.all, "detail", id] as const,
};

export async function fetchSalaryStructures() {
  const response = await apiClient.get<SalaryStructure[]>("/api/v1/salary-structures");
  return response.data;
}

export async function fetchSalaryStructure(id: string) {
  const response = await apiClient.get<SalaryStructure>(`/api/v1/salary-structures/${id}`);
  return response.data;
}

export async function createSalaryStructure(payload: SalaryStructureFormValues) {
  const response = await apiClient.post<SalaryStructure>("/api/v1/salary-structures", payload);
  return response.data;
}

export async function updateSalaryStructure(id: string, payload: SalaryStructureFormValues) {
  const response = await apiClient.put<SalaryStructure>(`/api/v1/salary-structures/${id}`, payload);
  return response.data;
}

export async function deleteSalaryStructure(id: string) {
  await apiClient.delete(`/api/v1/salary-structures/${id}`);
}

export function useSalaryStructures() {
  return useQuery({
    queryKey: structureKeys.all,
    queryFn: fetchSalaryStructures,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: structureKeys.detail(id),
    queryFn: () => fetchSalaryStructure(id),
    enabled: Boolean(id),
  });
}

export function useCreateSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSalaryStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: structureKeys.all }),
  });
}

export function useUpdateSalaryStructure(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalaryStructureFormValues) => updateSalaryStructure(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: structureKeys.all }),
  });
}

export function useDeleteSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSalaryStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: structureKeys.all }),
  });
}
