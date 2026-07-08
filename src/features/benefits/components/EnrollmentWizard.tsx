// src/features/benefits/components/EnrollmentWizard.tsx
// Sprint 10 F1 — Multi-step Benefits Enrollment Wizard
// Zustand local store for wizard step; RHF for form data.

"use client";

import React, { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { create } from "zustand";
import { cn, formatCurrency } from "@/lib/utils";
import { PlanCatalogList } from "./PlanCatalogList";
import { DependentForm } from "./DependentForm";
import { EnrollmentSummaryStep } from "./EnrollmentSummaryStep";
import { useEnrollmentWindowQuery } from "@/features/benefits/hooks/useEnrollmentWindowQuery";
import { useSubmitEnrollmentMutation } from "@/features/benefits/hooks/useSubmitEnrollmentMutation";
import {
  submitEnrollmentSchema,
  type SubmitEnrollmentFormValues,
} from "@/features/benefits/schemas/enrollment.schema";
import type { BenefitPlan } from "@/features/benefits/types/benefits.types";

// ─── Wizard State (Zustand, pure UI) ──────────────────────────────
interface WizardState {
  currentStep: number;
  selectedPlan: BenefitPlan | null;
  setStep: (step: number) => void;
  setSelectedPlan: (plan: BenefitPlan | null) => void;
  reset: () => void;
}

const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  selectedPlan: null,
  setStep: (step) => set({ currentStep: step }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  reset: () => set({ currentStep: 1, selectedPlan: null }),
}));

const STEPS = [
  { number: 1, label: "Select Plan" },
  { number: 2, label: "Add Dependents" },
  { number: 3, label: "Confirm & Sign" },
];

export function EnrollmentWizard() {
  const { currentStep, selectedPlan, setStep, setSelectedPlan, reset } =
    useWizardStore();

  const { data: window } = useEnrollmentWindowQuery();
  const submitMutation = useSubmitEnrollmentMutation();

  const isWindowOpen = window?.status === "OPEN";

  const form = useForm<SubmitEnrollmentFormValues>({
    resolver: zodResolver(submitEnrollmentSchema),
    defaultValues: {
      benefitPlanId: "",
      enrollmentWindowId: window?.id ?? "",
      coverageTier: "",
      dependents: [],
    },
    mode: "onTouched",
  });

  const handleSelectPlan = useCallback(
    (plan: BenefitPlan) => {
      setSelectedPlan(plan);
      form.setValue("benefitPlanId", plan.id);
    },
    [form, setSelectedPlan],
  );

  const handleNext = async () => {
    if (currentStep === 1 && !selectedPlan) return;

    if (currentStep === 3) {
      // Block submit if window is no longer open
      if (!isWindowOpen) return;

      const isValid = await form.trigger();
      if (!isValid) return;

      submitMutation.mutate(form.getValues(), {
        onSuccess: () => {
          reset();
          form.reset();
        },
      });
      return;
    }

    if (currentStep === 2) {
      // Validate step 2 before moving to summary
      const isValid = await form.trigger(["coverageTier", "dependents"]);
      if (!isValid) return;
    }

    setStep(Math.min(currentStep + 1, 3));
  };

  const handleBack = () => {
    setStep(Math.max(currentStep - 1, 1));
  };

  const canProceed =
    currentStep === 1
      ? !!selectedPlan && isWindowOpen
      : currentStep === 2
        ? true
        : isWindowOpen && !submitMutation.isPending;

  return (
    <div data-testid="enrollment-wizard" className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <nav aria-label="Enrollment steps" className="mb-8">
        <ol className="flex items-center gap-2">
          {STEPS.map((step, idx) => (
            <li key={step.number} className="flex items-center gap-2">
              <button
                type="button"
                data-testid={`wizard-step-${step.number}`}
                aria-current={currentStep === step.number ? "step" : undefined}
                disabled={step.number > currentStep && !selectedPlan}
                onClick={() => {
                  if (step.number <= currentStep) setStep(step.number);
                }}
                className="flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {step.number}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="h-px w-8 bg-border" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Window status banner */}
      {window && window.status !== "OPEN" && (
        <div
          data-testid="window-status-banner"
          className="mb-6 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800"
        >
          {window.status === "SCHEDULED" &&
            `Enrollment opens on ${new Date(window.opensAt).toLocaleDateString()}. Plans are read-only.`}
          {window.status === "CLOSED" && "Enrollment is closed. Plans are view-only."}
        </div>
      )}

      {submitMutation.isSuccess && !submitMutation.isPending && (
        <div
          data-testid="enrollment-confirmation"
          className="rounded-md bg-green-50 border border-green-200 p-6 text-center"
        >
          <h3 className="text-lg font-semibold text-green-800">
            Enrollment Submitted!
          </h3>
          <p className="mt-1 text-sm text-green-700">
            Your enrollment has been submitted and is pending confirmation.
          </p>
          <button
            type="button"
            data-testid="start-new-enrollment"
            onClick={() => {
              reset();
              form.reset();
              submitMutation.reset();
            }}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Start New Enrollment
          </button>
        </div>
      )}

      {!submitMutation.isSuccess && (
        <FormProvider {...form}>
          <div className="space-y-6">
            {currentStep === 1 && (
              <PlanCatalogList
                selectedPlanId={selectedPlan?.id ?? null}
                onSelectPlan={handleSelectPlan}
              />
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Coverage Tier
                  </label>
                  <select
                    {...form.register("coverageTier")}
                    data-testid="coverage-tier-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a tier</option>
                    {selectedPlan?.coverageTiers.map((t) => (
                      <option key={t.tier} value={t.tier}>
                        {t.tier} — {formatCurrency(t.employeeCost)}/period
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.coverageTier && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.coverageTier.message}
                    </p>
                  )}
                </div>
                <DependentForm />
              </div>
            )}

            {currentStep === 3 && (
              <EnrollmentSummaryStep
                selectedPlan={selectedPlan!}
                formValues={form.getValues()}
                isSubmitting={submitMutation.isPending}
              />
            )}

            {/* Error banner */}
            {submitMutation.isError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Unable to submit enrollment. Please check your details and try again.
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <button
              type="button"
              data-testid="wizard-back"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              data-testid="wizard-next"
              onClick={handleNext}
              disabled={!canProceed}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === 3 ? (
                "Submit Enrollment"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </FormProvider>
      )}
    </div>
  );
}

import { cn, formatCurrency } from "@/lib/utils";
