// src/features/benefits/components/EnrollmentSummaryStep.tsx
// Sprint 10 F1 — Read-only enrollment summary + eSign trigger

"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import type { BenefitPlan } from "@/features/benefits/types/benefits.types";
import type { SubmitEnrollmentFormValues } from "@/features/benefits/schemas/enrollment.schema";

const RELATIONSHIP_LABELS: Record<string, string> = {
  SPOUSE: "Spouse",
  CHILD: "Child",
  DOMESTIC_PARTNER: "Domestic Partner",
  OTHER: "Other",
};

interface EnrollmentSummaryStepProps {
  selectedPlan: BenefitPlan;
  formValues: SubmitEnrollmentFormValues;
  isSubmitting: boolean;
}

export function EnrollmentSummaryStep({
  selectedPlan,
  formValues,
  isSubmitting,
}: EnrollmentSummaryStepProps) {
  const tierCost =
    selectedPlan.coverageTiers.find(
      (t) => t.tier === formValues.coverageTier,
    )?.employeeCost ?? 0;

  return (
    <div data-testid="enrollment-summary" className="space-y-6">
      <h3 className="text-lg font-semibold">Enrollment Summary</h3>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Plan</span>
          <span className="text-sm font-medium">{selectedPlan.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Provider</span>
          <span className="text-sm font-medium">{selectedPlan.providerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Coverage Tier</span>
          <span className="text-sm font-medium">
            {formValues.coverageTier}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-sm text-muted-foreground">Your Cost</span>
          <span className="text-sm font-bold">
            {formatCurrency(tierCost)} / period
          </span>
        </div>
      </div>

      {formValues.dependents.length > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="text-sm font-semibold">Dependents</h4>
          {formValues.dependents.map((dep, idx) => (
            <div
              key={idx}
              data-testid={`summary-dependent-${idx}`}
              className="flex justify-between text-sm"
            >
              <span>{dep.fullName}</span>
              <span className="text-muted-foreground">
                {RELATIONSHIP_LABELS[dep.relationship] ?? dep.relationship} ·{" "}
                {dep.dateOfBirth}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        data-testid="esign-placeholder"
        className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          {isSubmitting
            ? "Processing your enrollment..."
            : "By submitting, you electronically sign your enrollment selections."}
        </p>
      </div>
    </div>
  );
}
