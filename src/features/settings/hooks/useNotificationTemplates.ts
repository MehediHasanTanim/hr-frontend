// src/features/settings/hooks/useNotificationTemplates.ts
// Sprint 6 — Notification templates hooks

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { NotificationTemplate } from "@/types/settings.types";
import { useToastStore } from "@/stores/toast.store";

export function useNotificationTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATION_TEMPLATES,
    queryFn: () =>
      apiClient
        .get<NotificationTemplate[]>("/api/v1/admin/notification-templates")
        .then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, channel, ...data }: { id: string; channel: string; subject?: string; body: string }) =>
      apiClient
        .put(`/api/v1/admin/notification-templates/${id}`, { channel, ...data })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION_TEMPLATES });
      addToast({ message: "Template saved.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to save template.", variant: "danger", duration: 5000 });
    },
  });
}
