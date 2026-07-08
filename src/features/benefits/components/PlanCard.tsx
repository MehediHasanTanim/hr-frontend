// src/features/benefits/components/PlanCard.tsx
// Sprint 10 F1 — Benefit Plan Card

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BenefitPlan } from "@/features/benefits/types/benefits.types";

const TYPE_LABELS: Record<string, string> = {
  HEALTH: "Health",
  DENTAL: "Dental",
  VISION: "Vision",
  LIFE: "Life",
  RETIREMENT: "Retirement",
  WELLNESS: "Wellness",
  OTHER: "Other",
};

interface PlanCardProps {
  plan: BenefitPlan;
  isSelected: boolean;
  onSelect: (plan: BenefitPlan) => void;
  disabled: boolean;
}

export function PlanCard({ plan, isSelected, onSelect, disabled }: PlanCardProps) {
  return (
    <button
      type="button"
      data-testid={`plan-card-${plan.id}`}
      disabled={disabled}
      onClick={() => onSelect(plan)}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-foreground">{plan.name}</h4>
          <p className="text-sm text-muted-foreground">{plan.providerName}</p>
        </div>
        <Badge variant="outline" data-testid={`plan-type-${plan.id}`}>
          {TYPE_LABELS[plan.type] ?? plan.type}
        </Badge>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Employer pays</span>
          <span className="font-medium text-green-600">
            {formatCurrency(plan.employerContribution)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Your cost</span>
          <span className="font-medium">
            {formatCurrency(plan.employeeContribution)}
          </span>
        </div>
      </div>

      {plan.coverageTiers.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Coverage Tiers
          </p>
          <ul className="space-y-0.5">
            {plan.coverageTiers.map((tier) => (
              <li
                key={tier.tier}
                className="flex justify-between text-xs"
              >
                <span>{tier.tier}</span>
                <span className="font-medium">
                  {formatCurrency(tier.employeeCost)} / period
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}
