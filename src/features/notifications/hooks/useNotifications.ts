import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../api/notifications.api";
import type { Notification, NotificationsListResponse } from "../types/notification.types";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications({ page: 1, limit: 20 }),
    refetchInterval: 30_000,
    staleTime: 0,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData<NotificationsListResponse>([
        "notifications",
      ]);

      if (previousData) {
        queryClient.setQueryData<NotificationsListResponse>(
          ["notifications"],
          {
            ...previousData,
            data: previousData.data.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n,
            ),
            unreadCount: Math.max(0, previousData.unreadCount - 1),
          },
        );
      }

      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData<NotificationsListResponse>([
        "notifications",
      ]);

      if (previousData) {
        queryClient.setQueryData<NotificationsListResponse>(
          ["notifications"],
          {
            ...previousData,
            data: previousData.data.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
          },
        );
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
