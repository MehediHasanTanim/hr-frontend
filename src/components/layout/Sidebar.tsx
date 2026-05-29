"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Settings,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/org-chart", label: "Org Chart", icon: Network },
  { href: "/dashboard/settings/company", label: "Settings", icon: Settings },
];

function NavList({ iconOnly = false, onNavigate }: { iconOnly?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const linkProps = onNavigate ? { onClick: onNavigate } : {};

        return (
          <Link
            aria-label={item.label}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              active && "bg-primary/10 text-primary",
              iconOnly && "justify-center px-2",
            )}
            href={item.href}
            key={item.href}
            title={iconOnly ? item.label : undefined}
            {...linkProps}
          >
            <Icon className="size-4" />
            {iconOnly ? null : <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ iconOnly = false }: { iconOnly?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <div className={cn("border-t pt-4", iconOnly && "flex flex-col items-center")}>
      <div className={cn("mb-3 flex items-center gap-3", iconOnly && "justify-center")}>
        <div className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          {(user?.name ?? "U").slice(0, 1).toUpperCase()}
        </div>
        {iconOnly ? null : (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? "Admin User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? "admin@example.com"}</p>
          </div>
        )}
      </div>
      <Button className={cn("w-full", iconOnly && "w-9 px-0")} size={iconOnly ? "icon" : "default"} type="button" variant="outline" onClick={logout}>
        <LogOut className="size-4" />
        {iconOnly ? null : "Logout"}
      </Button>
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-background p-4 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-2">
          <Boxes className="size-7 text-primary" />
          <span className="text-lg font-semibold">PeopleOps</span>
        </div>
        <div className="flex-1"><NavList /></div>
        <UserFooter />
      </aside>
      <aside className="hidden w-16 shrink-0 border-r bg-background p-3 md:flex md:flex-col lg:hidden">
        <div className="mb-8 grid place-items-center"><Boxes className="size-7 text-primary" /></div>
        <div className="flex-1"><NavList iconOnly /></div>
        <UserFooter iconOnly />
      </aside>
      <Button
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-30 md:hidden"
        size="icon"
        type="button"
        variant="outline"
        onClick={() => onMobileOpenChange?.(true)}
      >
        <Menu className="size-4" />
      </Button>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-foreground/40 md:hidden" role="presentation">
          <aside className="flex h-full w-72 flex-col bg-background p-4 shadow-lg">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="size-7 text-primary" />
                <span className="text-lg font-semibold">PeopleOps</span>
              </div>
              <Button aria-label="Close navigation" size="icon" type="button" variant="ghost" onClick={() => onMobileOpenChange?.(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1"><NavList onNavigate={() => onMobileOpenChange?.(false)} /></div>
            <UserFooter />
          </aside>
        </div>
      ) : null}
    </>
  );
}
