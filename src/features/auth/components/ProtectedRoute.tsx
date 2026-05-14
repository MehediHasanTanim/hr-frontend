"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";
import type { RefreshResponse } from "@/types/api";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [checking, setChecking] = useState(!accessToken);

  useEffect(() => {
    if (accessToken) {
      setChecking(false);
      return;
    }

    let active = true;

    apiClient
      .post<RefreshResponse>("/api/v1/auth/refresh", {}, { timeout: 2000 })
      .then((response) => {
        if (!active) {
          return;
        }
        useAuthStore.getState().setAuth(response.data.access, response.data.user ?? null);
        setChecking(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });

    return () => {
      active = false;
    };
  }, [accessToken, pathname, router]);

  if (checking) {
    return <div className="p-6 text-sm text-muted-foreground">Checking session...</div>;
  }

  return <>{children}</>;
}
