"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 pl-20 md:px-6 md:pl-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
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
