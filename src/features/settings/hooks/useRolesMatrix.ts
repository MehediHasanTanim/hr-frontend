// src/features/settings/hooks/useRolesMatrix.ts
// Sprint 6 — Roles matrix hooks

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { RolePermissionMatrix } from "@/types/settings.types";
import { useToastStore } from "@/stores/toast.store";

export function useRolesMatrix() {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES_MATRIX,
    queryFn: () =>
      apiClient.get<RolePermissionMatrix>("/api/v1/admin/roles").then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSaveRolesMatrix() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: (matrix: RolePermissionMatrix) =>
      apiClient.put("/api/v1/admin/roles", matrix).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES_MATRIX });
      addToast({ message: "Permissions saved successfully.", variant: "success", duration: 4000 });
    },
    onError: () => {
      addToast({ message: "Failed to save permissions.", variant: "danger", duration: 5000 });
    },
  });
}
