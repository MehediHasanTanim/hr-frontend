// src/features/integrations/webhooks/hooks.ts
// Sprint 12 — Webhooks React Query hooks

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";
import type {
  Webhook, WebhookDelivery, WebhookCreatedResponse,
  RegisterWebhookDto, TestPingResult,
} from "./types";

const keys = {
  all: ["integrations", "webhooks"] as const,
  list: () => [...keys.all, "list"] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
  deliveries: (id: string) => [...keys.all, "deliveries", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────
async function fetchWebhooks(): Promise<Webhook[]> {
  const res = await apiClient.get<Webhook[]>("/api/v1/integrations/webhooks");
  return res.data;
}
export function useWebhooks() {
  return useQuery({ queryKey: keys.list(), queryFn: fetchWebhooks });
}

async function fetchWebhook(id: string): Promise<Webhook> {
  const res = await apiClient.get<Webhook>(`/api/v1/integrations/webhooks/${id}`);
  return res.data;
}
export function useWebhook(id: string) {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => fetchWebhook(id), enabled: !!id });
}

async function fetchWebhookDeliveries(id: string): Promise<WebhookDelivery[]> {
  const res = await apiClient.get<WebhookDelivery[]>(`/api/v1/integrations/webhooks/${id}/deliveries`);
  return res.data;
}
export function useWebhookDeliveries(id: string) {
  const { data, ...rest } = useQuery({
    queryKey: keys.deliveries(id),
    queryFn: () => fetchWebhookDeliveries(id),
    enabled: !!id,
    // Poll every 5s only while PENDING rows exist
    refetchInterval: (query) => {
      const deliveries = query.state.data;
      if (!deliveries) return 5000;
      const hasPending = deliveries.some((d) => d.status === "PENDING");
      return hasPending ? 5000 : false;
    },
  });
  return { data, ...rest };
}

// ─── Mutations ────────────────────────────────────────────────
export function useRegisterWebhook() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (dto: RegisterWebhookDto) =>
      apiClient.post<WebhookCreatedResponse>("/api/v1/integrations/webhooks", dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      addToast({ message: "Webhook registered.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to register webhook.", variant: "danger", duration: 6000 });
    },
  });
}

export function useUpdateWebhook() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, ...dto }: RegisterWebhookDto & { id: string }) =>
      apiClient.put(`/api/v1/integrations/webhooks/${id}`, dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: keys.list() });
      addToast({ message: "Webhook updated.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to update webhook.", variant: "danger", duration: 6000 });
    },
  });
}

export function useTestPing() {
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<TestPingResult>(`/api/v1/integrations/webhooks/${id}/test`).then((r) => r.data),
    onSuccess: (data) => {
      addToast({
        message: `Ping ${data.success ? "success" : "failed"}: ${data.statusCode} (${data.latencyMs}ms)`,
        variant: data.success ? "success" : "warning",
        duration: 5000,
      });
    },
    onError: () => {
      addToast({ message: "Ping failed — could not reach endpoint.", variant: "danger", duration: 6000 });
    },
  });
}

export function useRotateSecret() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ rawSecret: string }>(`/api/v1/integrations/webhooks/${id}/rotate-secret`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      addToast({ message: "Secret rotated.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to rotate secret.", variant: "danger", duration: 6000 });
    },
  });
}
