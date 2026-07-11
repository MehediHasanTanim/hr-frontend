// src/features/integrations/api-keys/hooks.ts
// Sprint 12 — API Keys React Query hooks

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type { ApiKey, ApiKeyCreatedResponse, CreateApiKeyDto } from "./types";

const keys = {
  all: ["integrations", "api-keys"] as const,
  list: () => [...keys.all, "list"] as const,
};

async function fetchApiKeys(): Promise<ApiKey[]> {
  const res = await apiClient.get<ApiKey[]>("/api/v1/integrations/api-keys");
  return res.data;
}

export function useApiKeys() {
  return useQuery({ queryKey: keys.list(), queryFn: fetchApiKeys });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) =>
      apiClient.post<ApiKeyCreatedResponse>("/api/v1/integrations/api-keys", dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
    onError: () => {
      addToast({ message: "Failed to create API key.", variant: "danger", duration: 6000 });
    },
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/v1/integrations/api-keys/${id}/revoke`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      addToast({ message: "API key revoked.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to revoke API key.", variant: "danger", duration: 6000 });
    },
  });
}
