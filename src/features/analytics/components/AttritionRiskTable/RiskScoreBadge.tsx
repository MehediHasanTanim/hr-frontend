// src/features/analytics/components/AttritionRiskTable/RiskScoreBadge.tsx
"use client";
import React from "react";
import { cn } from "@/lib/utils";
import type { RiskBand } from "@/features/analytics/types/analytics";

const BAND_STYLE: Record<RiskBand, string> = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

export function RiskScoreBadge({ band, score }: { band: RiskBand; score: number }) {
  return (
    <span data-testid={`risk-badge-${band}`} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", BAND_STYLE[band])}>
      {band} ({score.toFixed(1)})
    </span>
  );
}
