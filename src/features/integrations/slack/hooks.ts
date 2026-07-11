// src/features/integrations/slack/hooks.ts
// Sprint 12 — Slack Integration React Query hooks

"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast.store";

interface SlackStatus { connected: boolean; workspaceName: string | null; }
interface SlackAuthUrl { url: string; }
interface ChannelMapping { eventType: string; channelId: string; channelName: string; }

const slackKeys = {
  status: ["integrations", "slack", "status"] as const,
  authUrl: ["integrations", "slack", "auth-url"] as const,
  mappings: ["integrations", "slack", "mappings"] as const,
};

export function useSlackStatus() {
  return useQuery({
    queryKey: slackKeys.status,
    queryFn: () => apiClient.get<SlackStatus>("/api/v1/integrations/slack/status").then((r) => r.data),
  });
}

export function useSlackAuthUrl() {
  return useQuery({
    queryKey: slackKeys.authUrl,
    queryFn: () => apiClient.get<SlackAuthUrl>("/api/v1/integrations/slack/auth-url").then((r) => r.data),
    enabled: false, // manual trigger
  });
}

export function useUpdateChannelMappings() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (mappings: ChannelMapping[]) =>
      apiClient.put("/api/v1/integrations/slack/mappings", { mappings }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slackKeys.mappings });
      addToast({ message: "Channel mappings updated.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to update mappings.", variant: "danger", duration: 6000 });
    },
  });
}
