"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { EmployeeSalary } from "@/features/payroll/types";
import type { EmployeeSalaryFormValues } from "@/features/payroll/schemas/employee-salary.schema";

export const salaryKeys = {
  employeeSalary: (id: string) => ["employee-salary", id] as const,
  history: (id: string) => ["employee-salary-history", id] as const,
};

export async function fetchEmployeeSalary(employeeId: string) {
  const response = await apiClient.get<EmployeeSalary>(`/api/v1/employees/${employeeId}/salary`);
  return response.data;
}

export async function fetchSalaryHistory(employeeId: string) {
  const response = await apiClient.get(`/api/v1/employees/${employeeId}/salary/history`);
  return response.data;
}

export async function assignEmployeeSalary(
  employeeId: string,
  payload: EmployeeSalaryFormValues,
) {
  const response = await apiClient.post<EmployeeSalary>(
    `/api/v1/employees/${employeeId}/salary`,
    payload,
  );
  return response.data;
}

export async function approveEmployeeSalary(id: string) {
  const response = await apiClient.patch(`/api/v1/salary/${id}/approve`);
  return response.data;
}

export function useEmployeeSalary(employeeId: string) {
  return useQuery({
    queryKey: salaryKeys.employeeSalary(employeeId),
    queryFn: () => fetchEmployeeSalary(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useSalaryHistory(employeeId: string) {
  return useQuery({
    queryKey: salaryKeys.history(employeeId),
    queryFn: () => fetchSalaryHistory(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useAssignEmployeeSalary(employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeSalaryFormValues) =>
      assignEmployeeSalary(employeeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salaryKeys.employeeSalary(employeeId) });
      qc.invalidateQueries({ queryKey: salaryKeys.history(employeeId) });
    },
  });
}

export function useApproveEmployeeSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveEmployeeSalary,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee-salary"] });
    },
  });
}
