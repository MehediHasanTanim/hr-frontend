"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";
import { getQueryClient } from "@/lib/query-client";

export function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } finally {
      useAuthStore.getState().clearAuth();
      getQueryClient().clear();
      router.push("/login");
    }
  };
}
