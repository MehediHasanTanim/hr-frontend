"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";
import type { NotificationListResponse } from "@/types/api";

function titleFromPath(pathname: string) {
  if (pathname.includes("/settings/company")) {
    return "Company Settings";
  }
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const title = useMemo(() => titleFromPath(pathname), [pathname]);
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiClient.get<NotificationListResponse>("/api/v1/notifications");
      return response.data;
    },
    retry: false,
  });

  const count =
    notifications.data?.unreadCount ??
    notifications.data?.count ??
    notifications.data?.results?.filter((item) => item.read !== true).length ??
    0;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 pl-20 md:px-6 md:pl-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Button aria-label="Notifications" size="icon" type="button" variant="ghost">
            <Bell className="size-5" />
          </Button>
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 text-center text-xs font-semibold text-destructive-foreground">
              {count}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {(user?.name ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.name ?? "Admin User"}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <a href="/dashboard/profile" className="hover:text-foreground">Profile</a>
              <a href="/dashboard/settings/company" className="hover:text-foreground">Settings</a>
              <button className="hover:text-foreground" type="button" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
