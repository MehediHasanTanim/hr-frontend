// src/features/settings/store/settings.store.ts
// Sprint 6 — Settings UI state (Zustand)

"use client";

import { create } from "zustand";
import type { Role, RolePermissionMatrix, NotificationTemplate } from "@/types/settings.types";

interface PermissionsState {
  matrix: RolePermissionMatrix | null;
  pendingChanges: Set<string>; // "ROLE:permission_key"
  setMatrix: (m: RolePermissionMatrix) => void;
  togglePermission: (role: Role, permission: string, current: boolean) => void;
  discardChanges: () => void;
  hasChanges: () => boolean;
}

export const useSettingsStore = create<PermissionsState>((set, get) => ({
  matrix: null,
  pendingChanges: new Set(),
  setMatrix: (m) => set({ matrix: m, pendingChanges: new Set() }),
  togglePermission: (role, permission, current) => {
    const key = `${role}:${permission}`;
    set((s) => {
      const next = new Set(s.pendingChanges);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { pendingChanges: next };
    });
  },
  discardChanges: () => {
    set({ pendingChanges: new Set() });
  },
  hasChanges: () => get().pendingChanges.size > 0,
}));
