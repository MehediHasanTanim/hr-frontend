"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationList } from "./NotificationList";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <Button
        aria-label="Notifications"
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 bg-background border rounded-lg shadow-lg overflow-hidden">
            <NotificationList onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
