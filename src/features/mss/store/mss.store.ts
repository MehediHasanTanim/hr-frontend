// src/features/mss/store/mss.store.ts
// Sprint 6 — MSS UI state (Zustand): tabs, selected rows, filters

"use client";

import { create } from "zustand";

type ApprovalTab = "leave" | "attendance";

interface MssState {
  activeTab: ApprovalTab;
  selectedIds: string[];
  setTab: (tab: ApprovalTab) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useMssStore = create<MssState>((set) => ({
  activeTab: "leave",
  selectedIds: [],
  setTab: (tab) => set({ activeTab: tab, selectedIds: [] }),
  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((i) => i !== id)
        : [...s.selectedIds, id],
    })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
}));
