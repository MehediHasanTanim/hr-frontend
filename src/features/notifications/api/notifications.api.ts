import { apiClient } from "@/lib/api-client";
import type {
  NotificationsListResponse,
} from "../types/notification.types";

export async function listNotifications(
  params?: { page?: number; limit?: number },
): Promise<NotificationsListResponse> {
  const response = await apiClient.get<NotificationsListResponse>(
    "/api/v1/notifications",
    { params },
  );
  return response.data;
}

export async function markRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/api/v1/notifications/${notificationId}/read`);
}

export async function markAllRead(): Promise<{ updated: number }> {
  const response = await apiClient.post<{ updated: number }>(
    "/api/v1/notifications/read-all",
  );
  return response.data;
}
