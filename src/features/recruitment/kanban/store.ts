// src/features/recruitment/kanban/store.ts
// Sprint 7 — Kanban UI store (Zustand client-only state)
// Manages: drag-in-progress, optimistic order, archived panel visibility, modals

"use client";

import { create } from "zustand";
import type { ApplicationStage } from "@/types/recruitment";

interface KanbanUiState {
  // ─── Drag state ──────────────────────────────────────────────
  draggingCardId: string | null;
  draggingFromStage: ApplicationStage | null;
  // Transient optimistic order override; cleared after drag settles
  optimisticOrderOverride: Record<ApplicationStage, string[]> | null;

  setDragging: (cardId: string, fromStage: ApplicationStage) => void;
  clearDragging: () => void;
  setOptimisticOrder: (order: Record<ApplicationStage, string[]>) => void;
  clearOptimisticOrder: () => void;

  // ─── UI state ────────────────────────────────────────────────
  isArchivedExpanded: boolean;
  toggleArchived: () => void;

  // ─── Reject modal state ─────────────────────────────────────
  rejectModal: { applicationId: string; candidateName: string } | null;
  openRejectModal: (applicationId: string, candidateName: string) => void;
  closeRejectModal: () => void;
}

export const useKanbanUiStore = create<KanbanUiState>((set) => ({
  draggingCardId: null,
  draggingFromStage: null,
  optimisticOrderOverride: null,

  setDragging: (cardId, fromStage) =>
    set({ draggingCardId: cardId, draggingFromStage: fromStage }),
  clearDragging: () =>
    set({ draggingCardId: null, draggingFromStage: null }),

  setOptimisticOrder: (order) => set({ optimisticOrderOverride: order }),
  clearOptimisticOrder: () => set({ optimisticOrderOverride: null }),

  isArchivedExpanded: false,
  toggleArchived: () => set((s) => ({ isArchivedExpanded: !s.isArchivedExpanded })),

  rejectModal: null,
  openRejectModal: (applicationId, candidateName) =>
    set({ rejectModal: { applicationId, candidateName } }),
  closeRejectModal: () => set({ rejectModal: null }),
}));
