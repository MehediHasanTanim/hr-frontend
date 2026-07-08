// src/features/analytics/components/ReportBuilder/FilterBuilder.tsx
"use client";
import React from "react";
import { Plus } from "lucide-react";
import { FilterRow } from "./FilterRow";
import type { ReportFilter } from "@/features/analytics/types/analytics";

interface FilterBuilderProps {
  filters: ReportFilter[];
  availableFields: string[];
  onChange: (filters: ReportFilter[]) => void;
}

export function FilterBuilder({ filters, availableFields, onChange }: FilterBuilderProps) {
  const addFilter = () => {
    onChange([...filters, { field: "", operator: "EQ", value: "" }]);
  };

  const updateFilter = (idx: number, f: ReportFilter) => {
    const next = [...filters];
    next[idx] = f;
    onChange(next);
  };

  const removeFilter = (idx: number) => {
    onChange(filters.filter((_, i) => i \!== idx));
  };

  return (
    <div data-testid="filter-builder" className="space-y-2">
      {filters.map((f, i) => (
        <FilterRow
          key={i}
          filter={f}
          availableFields={availableFields}
          onChange={(updated) => updateFilter(i, updated)}
          onRemove={() => removeFilter(i)}
        />
      ))}
      <button
        type="button"
        data-testid="add-filter-btn"
        onClick={addFilter}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="h-3 w-3" /> Add Filter
      </button>
    </div>
  );
}
