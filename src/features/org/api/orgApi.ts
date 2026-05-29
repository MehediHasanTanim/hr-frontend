"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { DepartmentValues } from "@/features/org/schemas/org.schema";
import type { Department, OrgChartNode } from "@/features/org/types/org.types";

export const orgKeys = {
  chart: ["org", "chart"] as const,
  departments: ["org", "departments"] as const,
};

export function useOrgChartQuery() {
  return useQuery({
    queryKey: orgKeys.chart,
    queryFn: async () => {
      const response = await apiClient.get<OrgChartNode>("/api/v1/org-chart");
      return response.data;
    },
  });
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: orgKeys.departments,
    queryFn: async () => {
      const response = await apiClient.get<Department[]>("/api/v1/departments");
      return response.data;
    },
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DepartmentValues) => {
      const response = await apiClient.post<Department>("/api/v1/departments", payload);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.departments }),
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: DepartmentValues }) => {
      const response = await apiClient.patch<Department>(`/api/v1/departments/${id}`, payload);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.departments }),
  });
}

export function useDeactivateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<Department>(`/api/v1/departments/${id}`, { status: "inactive" });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.departments }),
  });
}
