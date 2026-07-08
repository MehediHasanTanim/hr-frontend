// src/features/analytics/components/ReportBuilder/FilterRow.tsx
// Sprint 11 F2 — Single filter row (field + operator + value)

"use client";
import React from "react";
import { Trash2 } from "lucide-react";
import type { ReportFilter, ReportFilterOperator } from "@/features/analytics/types/analytics";

const STRING_OPS: ReportFilterOperator[] = ["EQ", "NEQ", "LIKE", "IN"];
const NUMBER_OPS: ReportFilterOperator[] = ["EQ", "NEQ", "GT", "GTE", "LT", "LTE", "IN"];
const DATE_OPS: ReportFilterOperator[] = ["GT", "GTE", "LT", "LTE", "EQ", "BETWEEN"];

interface FilterRowProps {
  filter: ReportFilter;
  availableFields: string[];
  onChange: (f: ReportFilter) => void;
  onRemove: () => void;
}

export function FilterRow({ filter, availableFields, onChange, onRemove }: FilterRowProps) {
  return (
    <div data-testid="filter-row" className="flex items-center gap-2 rounded-md border p-2">
      <select
        data-testid="filter-field"
        value={filter.field}
        onChange={(e) => onChange({ ...filter, field: e.target.value })}
        className="flex h-9 rounded-md border bg-background px-2 text-xs min-w-[120px]"
      >
        <option value="">Field</option>
        {availableFields.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        data-testid="filter-operator"
        value={filter.operator}
        onChange={(e) => onChange({ ...filter, operator: e.target.value as ReportFilterOperator })}
        className="flex h-9 rounded-md border bg-background px-2 text-xs min-w-[100px]"
      >
        {[...STRING_OPS, ...NUMBER_OPS, ...DATE_OPS]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
      </select>

      <input
        type="text"
        data-testid="filter-value"
        value={typeof filter.value === "string" || typeof filter.value === "number" ? String(filter.value) : ""}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
        placeholder="Value"
        className="flex h-9 flex-1 rounded-md border bg-background px-2 text-xs"
      />

      <button
        type="button"
        data-testid="remove-filter-btn"
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
        aria-label="Remove filter"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
