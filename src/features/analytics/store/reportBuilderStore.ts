// src/features/analytics/store/reportBuilderStore.ts
// Sprint 11 — Report Builder UI State (Zustand — draft definition, active panel)
// NO server state here — all data lives in React Query.

"use client";

import { create } from "zustand";
import type {
  ReportDefinition,
  ReportEntityType,
  ReportFilter,
} from "@/features/analytics/types/analytics";

export type BuilderStep = "entity" | "filters" | "columns" | "preview";

interface ReportBuilderState {
  // Step navigation
  currentStep: BuilderStep;
  setStep: (step: BuilderStep) => void;

  // Draft definition (local scratch — saved to backend on explicit "Save")
  entityType: ReportEntityType | null;
  selectedFields: string[];
  filters: ReportFilter[];
  columns: string[];
  sort: { field: string; direction: "ASC" | "DESC" }[];
  limit: number | undefined;

  setEntityType: (t: ReportEntityType | null) => void;
  toggleField: (field: string) => void;
  setFilters: (filters: ReportFilter[]) => void;
  setColumns: (columns: string[]) => void;
  setSort: (sort: { field: string; direction: "ASC" | "DESC" }[]) => void;
  setLimit: (limit: number | undefined) => void;

  // Build the current draft into a ReportDefinition
  buildDefinition: () => ReportDefinition | null;

  // Reset
  reset: () => void;
}

const initialFields: string[] = [];
const initialFilters: ReportFilter[] = [];
const initialColumns: string[] = [];
const initialSort: { field: string; direction: "ASC" | "DESC" }[] = [];

export const useReportBuilderStore = create<ReportBuilderState>((set, get) => ({
  currentStep: "entity",
  entityType: null,
  selectedFields: initialFields,
  filters: initialFilters,
  columns: initialColumns,
  sort: initialSort,
  limit: undefined,

  setStep: (step) => set({ currentStep: step }),

  setEntityType: (t) => set({ entityType: t, selectedFields: [], columns: [] }),

  toggleField: (field) => {
    const { selectedFields, columns } = get();
    const isSelected = selectedFields.includes(field);
    const nextFields = isSelected
      ? selectedFields.filter((f) => f !== field)
      : [...selectedFields, field];
    const nextColumns = isSelected
      ? columns.filter((c) => c !== field)
      : columns;
    set({ selectedFields: nextFields, columns: nextColumns });
  },

  setFilters: (filters) => set({ filters }),
  setColumns: (columns) => set({ columns }),
  setSort: (sort) => set({ sort }),
  setLimit: (limit) => set({ limit }),

  buildDefinition: () => {
    const { selectedFields, filters, columns, sort, limit } = get();
    if (selectedFields.length === 0) return null;
    return {
      fields: selectedFields,
      filters,
      columns: columns.length > 0 ? columns : selectedFields,
      sort: sort.length > 0 ? sort : undefined,
      limit,
    };
  },

  reset: () =>
    set({
      currentStep: "entity",
      entityType: null,
      selectedFields: [],
      filters: [],
      columns: [],
      sort: [],
      limit: undefined,
    }),
}));
