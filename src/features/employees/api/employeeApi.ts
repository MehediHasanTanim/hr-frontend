"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  Employee,
  EmployeeFormPayload,
  EmployeeListQuery,
  EmployeeListResponse,
  EmploymentHistoryRecord,
  ImportJob,
} from "@/features/employees/types/employee.types";

export const defaultEmployeeQuery: EmployeeListQuery = {
  search: "",
  departmentId: "",
  status: "",
  employeeType: "",
  page: 1,
  pageSize: 10,
  sortBy: "joiningDate",
  sortOrder: "desc",
};

export const employeeKeys = {
  all: ["employees"] as const,
  list: (query: EmployeeListQuery) => [...employeeKeys.all, "list", query] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
  history: (id: string) => [...employeeKeys.all, "history", id] as const,
  importJob: (id: string) => [...employeeKeys.all, "import", id] as const,
};

export function parseEmployeeQuery(params: URLSearchParams): EmployeeListQuery {
  return {
    search: params.get("search") ?? "",
    departmentId: params.get("departmentId") ?? "",
    status: params.get("status") ?? "",
    employeeType: params.get("employeeType") ?? "",
    page: Number(params.get("page") ?? defaultEmployeeQuery.page) || defaultEmployeeQuery.page,
    pageSize: Number(params.get("pageSize") ?? defaultEmployeeQuery.pageSize) || defaultEmployeeQuery.pageSize,
    sortBy: params.get("sortBy") ?? defaultEmployeeQuery.sortBy,
    sortOrder: params.get("sortOrder") === "asc" ? "asc" : "desc",
  };
}

export function serializeEmployeeQuery(query: EmployeeListQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== defaultEmployeeQuery[key as keyof EmployeeListQuery]) {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export async function fetchEmployees(query: EmployeeListQuery) {
  const response = await apiClient.get<EmployeeListResponse>("/api/v1/employees", { params: query });
  return response.data;
}

export async function fetchEmployee(id: string) {
  const response = await apiClient.get<Employee>(`/api/v1/employees/${id}`);
  return response.data;
}

export async function createEmployee(payload: EmployeeFormPayload) {
  const response = await apiClient.post<Employee>("/api/v1/employees", payload);
  return response.data;
}

export async function updateEmployee(id: string, payload: EmployeeFormPayload) {
  const response = await apiClient.patch<Employee>(`/api/v1/employees/${id}`, payload);
  return response.data;
}

export async function deleteEmployee(id: string) {
  await apiClient.delete(`/api/v1/employees/${id}`);
}

export async function fetchEmploymentHistory(employeeId: string) {
  const response = await apiClient.get<EmploymentHistoryRecord[]>(`/api/v1/employees/${employeeId}/history`);
  return response.data;
}

export async function startBulkImport(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await apiClient.post<ImportJob>("/api/v1/employees/import", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function fetchBulkImportJob(jobId: string) {
  const response = await apiClient.get<ImportJob>(`/api/v1/employees/import/${jobId}`);
  return response.data;
}

export function useEmployeesQuery(query: EmployeeListQuery) {
  return useQuery({ queryKey: employeeKeys.list(query), queryFn: () => fetchEmployees(query) });
}

export function useEmployeeQuery(id: string) {
  return useQuery({ queryKey: employeeKeys.detail(id), queryFn: () => fetchEmployee(id), enabled: Boolean(id) });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useUpdateEmployeeMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeFormPayload) => updateEmployee(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeKeys.detail(id), employee);
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useEmploymentHistoryQuery(employeeId: string) {
  return useQuery({
    queryKey: employeeKeys.history(employeeId),
    queryFn: () => fetchEmploymentHistory(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useBulkImportMutation() {
  return useMutation({ mutationFn: startBulkImport });
}

export function useBulkImportJobQuery(jobId: string) {
  return useQuery({
    queryKey: employeeKeys.importJob(jobId),
    queryFn: () => fetchBulkImportJob(jobId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}
