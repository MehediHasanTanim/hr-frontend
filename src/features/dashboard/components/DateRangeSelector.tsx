// src/features/dashboard/components/DateRangeSelector.tsx
// Sprint 6 — Dashboard date range preset selector

"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardStore, type DateRange } from "../store/dashboard.store";

const PRESETS: { key: DateRange["preset"]; label: string }[] = [
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_quarter", label: "This Quarter" },
  { key: "this_year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

export function DateRangeSelector() {
  const { dateRange, setPreset, setDateRange } = useDashboardStore();
  const [customStart, setCustomStart] = React.useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = React.useState(dateRange.endDate);

  const activeLabel =
    PRESETS.find((p) => p.key === dateRange.preset)?.label ?? "This Month";

  function handlePresetChange(preset: DateRange["preset"]) {
    if (preset === "custom") {
      setCustomStart(dateRange.startDate);
      setCustomEnd(dateRange.endDate);
    }
    setPreset(preset);
  }

  function handleCustomApply() {
    setDateRange({
      startDate: customStart,
      endDate: customEnd,
      preset: "custom",
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" data-testid="date-range-trigger">
          <Calendar className="mr-2 h-4 w-4" />
          {activeLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-1">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetChange(key)}
              data-testid={`preset-${key}`}
              className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                dateRange.preset === key ? "bg-accent font-medium" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {dateRange.preset === "custom" && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <label className="text-xs font-medium text-muted-foreground">
              Start Date
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="mt-1 block w-full rounded border px-2 py-1 text-sm"
                aria-label="Custom start date"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              End Date
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="mt-1 block w-full rounded border px-2 py-1 text-sm"
                aria-label="Custom end date"
              />
            </label>
            <Button size="sm" className="w-full" onClick={handleCustomApply} data-testid="custom-apply-btn">
              Apply Range
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
