"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkAllRead } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { data, isLoading } = useNotifications();
  const markAllReadMutation = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="w-80">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => markAllReadMutation.mutate()}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
        >
          {markAllReadMutation.isPending
            ? "Marking..."
            : "Mark all as read"}
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No notifications yet.
          </p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onNavigate={onClose}
            />
          ))
        )}
      </div>

      <div className="border-t px-4 py-2">
        <a
          href="/notifications"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="text-xs text-primary hover:underline"
        >
          View all
        </a>
      </div>
    </div>
  );
}
