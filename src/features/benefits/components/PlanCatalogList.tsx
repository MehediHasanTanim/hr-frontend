// src/features/benefits/components/PlanCatalogList.tsx
// Sprint 10 F1 — Plan Catalog Filterable List

"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBenefitPlansQuery } from "@/features/benefits/hooks/useBenefitPlansQuery";
import { useEnrollmentWindowQuery } from "@/features/benefits/hooks/useEnrollmentWindowQuery";
import { PlanCard } from "./PlanCard";
import type { BenefitPlan, BenefitPlanType } from "@/features/benefits/types/benefits.types";

const PLAN_TYPES: BenefitPlanType[] = [
  "HEALTH",
  "DENTAL",
  "VISION",
  "LIFE",
  "RETIREMENT",
  "WELLNESS",
  "OTHER",
];

interface PlanCatalogListProps {
  selectedPlanId: string | null;
  onSelectPlan: (plan: BenefitPlan) => void;
}

export function PlanCatalogList({
  selectedPlanId,
  onSelectPlan,
}: PlanCatalogListProps) {
  const { data: plans, isLoading, isError } = useBenefitPlansQuery();
  const { data: window } = useEnrollmentWindowQuery();
  const [typeFilter, setTypeFilter] = useState<BenefitPlanType | "ALL">("ALL");

  const isWindowOpen = window?.status === "OPEN";
  const eligibleIds = window?.eligiblePlanIds ?? [];

  const filteredPlans = (plans ?? [])
    .filter((p) => typeFilter === "ALL" || p.type === typeFilter)
    .filter((p) => eligibleIds.length === 0 || eligibleIds.includes(p.id));

  return (
    <div data-testid="plan-catalog">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["ALL", ...PLAN_TYPES] as const).map((type) => (
          <button
            key={type}
            type="button"
            data-testid={`plan-type-filter-${type}`}
            onClick={() => setTypeFilter(type)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              typeFilter === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {type === "ALL" ? "All" : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div
          data-testid="plan-catalog-loading"
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div
          data-testid="plan-catalog-error"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Unable to load benefit plans. Please try again.
        </div>
      )}

      {!isLoading && !isError && filteredPlans.length === 0 && (
        <div
          data-testid="plan-catalog-empty"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          No plans match your filter.
        </div>
      )}

      {!isLoading && !isError && filteredPlans.length > 0 && (
        <div
          data-testid="plan-catalog-grid"
          className="grid gap-4 sm:grid-cols-2"
        >
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              onSelect={onSelectPlan}
              disabled={!isWindowOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
