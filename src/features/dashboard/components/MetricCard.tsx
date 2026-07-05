// src/features/dashboard/components/MetricCard.tsx
// Sprint 6 — Dashboard metric card with skeleton, trend, and error states

"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const colorSchemes = {
  blue: "ring-blue-200 bg-blue-50 dark:bg-blue-950",
  amber: "ring-amber-200 bg-amber-50 dark:bg-amber-950",
  green: "ring-green-200 bg-green-50 dark:bg-green-950",
  purple: "ring-purple-200 bg-purple-50 dark:bg-purple-950",
} as const;

type ColorScheme = keyof typeof colorSchemes;

interface MetricCardProps {
  title: string;
  value: string | number;
  secondaryLabel?: string;
  secondaryValue?: string | number;
  trend?: { direction: "up" | "down" | "flat"; delta: string };
  isLoading: boolean;
  isError?: boolean;
  icon: React.ReactNode;
  colorScheme: ColorScheme;
}

const trendStyles = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-600 dark:text-red-400",
  flat: "text-gray-500",
};

const trendArrows = {
  up: "↑",
  down: "↓",
  flat: "—",
};

export function MetricCard({
  title,
  value,
  secondaryLabel,
  secondaryValue,
  trend,
  isLoading,
  isError,
  icon,
  colorScheme,
}: MetricCardProps) {
  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 ring-1 transition-shadow hover:shadow-md",
        colorSchemes[colorScheme],
      )}
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-muted-foreground/70">{icon}</span>
      </div>

      {isError ? (
        <div className="mt-2 text-sm text-red-500" role="alert">
          Failed to load
        </div>
      ) : (
        <>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                trendStyles[trend.direction],
              )}
            >
              <span aria-hidden="true">{trendArrows[trend.direction]}</span>
              {trend.delta}
            </p>
          )}
          {secondaryLabel && (
            <p className="mt-1 text-xs text-muted-foreground">
              {secondaryLabel}:{" "}
              <span className="font-medium text-foreground">{secondaryValue}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-4 ring-1 ring-border"
      data-testid="metric-card-skeleton"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}
