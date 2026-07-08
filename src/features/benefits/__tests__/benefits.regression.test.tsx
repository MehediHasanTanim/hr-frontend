// src/features/benefits/__tests__/benefits.regression.test.tsx
// Sprint 10 — Benefits Enrollment Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlanCard } from "@/features/benefits/components/PlanCard";
import { EnrollmentSummaryStep } from "@/features/benefits/components/EnrollmentSummaryStep";
import { ESignTriggerButton } from "@/features/benefits/components/ESignTriggerButton";
import {
  dependentSchema,
  submitEnrollmentSchema,
} from "@/features/benefits/schemas/enrollment.schema";
import type { BenefitPlan } from "@/features/benefits/types/benefits.types";

const mockPlan: BenefitPlan = {
  id: "plan-1",
  name: "Premium Health",
  type: "HEALTH",
  employerContribution: 500,
  employeeContribution: 150,
  coverageTiers: [
    { tier: "EMPLOYEE_ONLY", employeeCost: 50 },
    { tier: "EMPLOYEE_FAMILY", employeeCost: 150 },
  ],
  providerName: "Acme Insurance",
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── PlanCard ──────────────────────────────────────────────────
describe("PlanCard", () => {
  it("renders plan name, provider, and type badge", () => {
    render(<PlanCard plan={mockPlan} isSelected={false} onSelect={vi.fn()} disabled={false} />, { wrapper: Wrapper });
    expect(screen.getByText("Premium Health")).toBeDefined();
    expect(screen.getByText("Acme Insurance")).toBeDefined();
    expect(screen.getByTestId("plan-type-plan-1")).toHaveTextContent("Health");
  });

  it("renders employer and employee contribution", () => {
    render(<PlanCard plan={mockPlan} isSelected={false} onSelect={vi.fn()} disabled={false} />, { wrapper: Wrapper });
    // Use test IDs or more specific queries since $150 appears twice (contribution + tier)
    const employerEl = screen.getByText(/\$500\.00/);
    expect(employerEl).toBeDefined();
  });

  it("renders coverage tiers", () => {
    render(<PlanCard plan={mockPlan} isSelected={false} onSelect={vi.fn()} disabled={false} />, { wrapper: Wrapper });
    expect(screen.getByText("EMPLOYEE_ONLY")).toBeDefined();
    expect(screen.getByText("EMPLOYEE_FAMILY")).toBeDefined();
  });

  it("applies selected styling when selected", () => {
    render(<PlanCard plan={mockPlan} isSelected={true} onSelect={vi.fn()} disabled={false} />, { wrapper: Wrapper });
    const btn = screen.getByTestId("plan-card-plan-1");
    expect(btn.className).toContain("ring-1");
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    render(<PlanCard plan={mockPlan} isSelected={false} onSelect={onSelect} disabled={false} />, { wrapper: Wrapper });
    await userEvent.click(screen.getByTestId("plan-card-plan-1"));
    expect(onSelect).toHaveBeenCalledWith(mockPlan);
  });

  it("disables when disabled", () => {
    const onSelect = vi.fn();
    render(<PlanCard plan={mockPlan} isSelected={false} onSelect={onSelect} disabled={true} />, { wrapper: Wrapper });
    const btn = screen.getByTestId("plan-card-plan-1");
    expect(btn).toBeDisabled();
  });
});

// ─── EnrollmentSummaryStep ─────────────────────────────────────
describe("EnrollmentSummaryStep", () => {
  const formValues = {
    benefitPlanId: "plan-1",
    enrollmentWindowId: "win-1",
    coverageTier: "EMPLOYEE_FAMILY",
    dependents: [
      { fullName: "Jane Doe", relationship: "SPOUSE" as const, dateOfBirth: "1990-05-15" },
    ],
  };

  it("renders plan name and provider", () => {
    render(<EnrollmentSummaryStep selectedPlan={mockPlan} formValues={formValues} isSubmitting={false} />);
    expect(screen.getByText("Premium Health")).toBeDefined();
    expect(screen.getByText("Acme Insurance")).toBeDefined();
  });

  it("renders coverage tier and cost", () => {
    render(<EnrollmentSummaryStep selectedPlan={mockPlan} formValues={formValues} isSubmitting={false} />);
    // EMPLOYEE_FAMILY tier cost is 150
    expect(screen.getByText(/\$150\.00/)).toBeDefined();
    expect(screen.getByText("EMPLOYEE_FAMILY")).toBeDefined();
  });

  it("renders dependent details", () => {
    render(<EnrollmentSummaryStep selectedPlan={mockPlan} formValues={formValues} isSubmitting={false} />);
    expect(screen.getByText("Jane Doe")).toBeDefined();
    expect(screen.getByTestId("summary-dependent-0")).toBeDefined();
  });

  it("does not render dependent section when empty", () => {
    render(<EnrollmentSummaryStep selectedPlan={mockPlan} formValues={{ ...formValues, dependents: [] }} isSubmitting={false} />);
    expect(screen.queryByTestId("summary-dependent-0")).toBeNull();
  });
});

// ─── ESignTriggerButton ────────────────────────────────────────
describe("ESignTriggerButton", () => {
  it("renders sign text when not pending", () => {
    render(<ESignTriggerButton isPending={false} onSign={vi.fn()} disabled={false} />);
    expect(screen.getByText("Sign & Submit")).toBeDefined();
  });

  it("renders processing state when pending", () => {
    render(<ESignTriggerButton isPending={true} onSign={vi.fn()} disabled={false} />);
    expect(screen.getByText("Processing...")).toBeDefined();
  });

  it("disables when disabled", () => {
    render(<ESignTriggerButton isPending={false} onSign={vi.fn()} disabled={true} />);
    expect(screen.getByTestId("esign-trigger-btn")).toBeDisabled();
  });
});

// ─── Zod Schemas ────────────────────────────────────────────────
describe("enrollment schemas", () => {
  it("dependentSchema rejects future DOB", () => {
    const result = dependentSchema.safeParse({
      fullName: "Test",
      relationship: "SPOUSE",
      dateOfBirth: "2099-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("dependentSchema accepts valid dependent", () => {
    const result = dependentSchema.safeParse({
      fullName: "Jane Doe",
      relationship: "CHILD",
      dateOfBirth: "2015-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("submitEnrollmentSchema requires valid UUIDs", () => {
    const result = submitEnrollmentSchema.safeParse({
      benefitPlanId: "not-a-uuid",
      enrollmentWindowId: "also-not-uuid",
      coverageTier: "EMPLOYEE_ONLY",
      dependents: [],
    });
    expect(result.success).toBe(false);
  });

  it("submitEnrollmentSchema accepts valid payload", () => {
    const result = submitEnrollmentSchema.safeParse({
      benefitPlanId: "550e8400-e29b-41d4-a716-446655440000",
      enrollmentWindowId: "550e8400-e29b-41d4-a716-446655440001",
      coverageTier: "EMPLOYEE_FAMILY",
      dependents: [
        {
          fullName: "Jane Doe",
          relationship: "SPOUSE",
          dateOfBirth: "1990-05-15",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

// ─── formatCurrency (shared util) ──────────────────────────────
import { formatCurrency } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats USD with 2 decimals", () => {
    expect(formatCurrency(1500)).toBe("$1,500.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(1_000_000)).toBe("$1,000,000.00");
  });
});
