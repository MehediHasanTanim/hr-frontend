"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { CompanyResponse } from "@/types/api";

const defaultCompany: CompanyResponse = {
  name: "",
  address: "",
  phone: "",
  logoUrl: "",
  timezone: "Asia/Dhaka",
  currency: "USD",
  dateFormat: "YYYY-MM-DD",
  fiscalYearStartMonth: "January",
};

export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await apiClient.get<Partial<CompanyResponse>>("/api/v1/company");
      return { ...defaultCompany, ...response.data };
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CompanyResponse>) => {
      const response = await apiClient.patch<Partial<CompanyResponse>>("/api/v1/company", payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CompanyResponse>(["company"], (current) => ({
        ...defaultCompany,
        ...current,
        ...data,
      }));
    },
  });
}

export function useUploadLogo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      const response = await apiClient.post<{ url?: string; logoUrl?: string }>(
        "/api/v1/company/logo",
        body,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data.logoUrl ?? response.data.url ?? "";
    },
  });
}
