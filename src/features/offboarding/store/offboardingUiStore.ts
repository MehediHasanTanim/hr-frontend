// src/features/offboarding/store/offboardingUiStore.ts
// Sprint 11 — Offboarding UI State (Zustand — checklist filter, wizard step)
// NO server state here — all data lives in React Query.

"use client";

import { create } from "zustand";
import type { ChecklistTaskCategory } from "@/features/offboarding/types/offboarding";

interface OffboardingUiState {
  // Checklist category filter
  activeChecklistFilter: ChecklistTaskCategory | "ALL";
  setActiveChecklistFilter: (filter: ChecklistTaskCategory | "ALL") => void;

  // Exit request wizard step (admin form)
  adminWizardStep: number;
  setAdminWizardStep: (step: number) => void;
}

export const useOffboardingUiStore = create<OffboardingUiState>((set) => ({
  activeChecklistFilter: "ALL",
  setActiveChecklistFilter: (filter) => set({ activeChecklistFilter: filter }),
  adminWizardStep: 1,
  setAdminWizardStep: (step) => set({ adminWizardStep: step }),
}));
