// src/features/analytics/components/ExecutiveDashboard/KpiCard.tsx
// Sprint 11 F1 — Generic KPI card for executive dashboard

"use client";
import React from "react";
import { ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  deltaVsPreviousPeriod?: string;
  trend?: "up" | "down" | "flat";
  isLoading: boolean;
  deltaSemantics?: "higherIsBetter" | "lowerIsBetter" | "neutral";
}

export function KpiCard({
  label,
  value,
  deltaVsPreviousPeriod,
  trend,
  isLoading,
  deltaSemantics = "neutral",
}: KpiCardProps) {
  const deltaColor =
    trend === "up"
      ? deltaSemantics === "lowerIsBetter"
        ? "text-destructive"
        : "text-green-600"
      : trend === "down"
        ? deltaSemantics === "higherIsBetter"
          ? "text-destructive"
          : "text-green-600"
        : "text-muted-foreground";

  return (
    <div
      data-testid={`kpi-card-${label.replace(/\s+/g, "-").toLowerCase()}`}
      className="rounded-lg border bg-card p-4"
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {isLoading ? (
        <Loader2 className="mt-1 h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <p className="mt-1 text-2xl font-bold">{value}</p>
      )}
      {!isLoading && deltaVsPreviousPeriod && trend && (
        <p className={cn("mt-1 flex items-center gap-1 text-xs", deltaColor)}>
          {trend === "up" && <ArrowUp className="h-3 w-3" />}
          {trend === "down" && <ArrowDown className="h-3 w-3" />}
          {trend === "flat" && <Minus className="h-3 w-3" />}
          {deltaVsPreviousPeriod} vs previous period
        </p>
      )}
    </div>
  );
}
