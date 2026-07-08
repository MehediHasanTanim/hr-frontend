// src/features/compensation/__tests__/compensation.regression.test.tsx
// Sprint 10 — Compensation & Bonus Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BonusCycleBudgetTracker } from "@/features/compensation/components/BonusCycleBudgetTracker";
import { ApproveCycleButton } from "@/features/compensation/components/ApproveCycleButton";
import { CompStatementDownloadButton } from "@/features/compensation/components/CompStatementDownloadButton";
import {
  proposeAllocationSchema,
  approveAllocationSchema,
} from "@/features/compensation/schemas/allocation.schema";
import type {
  CompensationCycle,
  EmployeeAllocation,
} from "@/features/compensation/types/compensation.types";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── BonusCycleBudgetTracker ───────────────────────────────────
describe("BonusCycleBudgetTracker", () => {
  const baseCycle: CompensationCycle = {
    id: "cy-1",
    name: "Q1 Bonus",
    fiscalYear: "2026",
    status: "OPEN",
    totalBudget: 100_000,
    allocatedTotal: 0,
  };

  it("renders budget and allocation text", () => {
    render(<BonusCycleBudgetTracker cycle={baseCycle} />, { wrapper: Wrapper });
    expect(screen.getByTestId("budget-tracker")).toBeDefined();
  });

  it("shows normal state at 0%", () => {
    render(<BonusCycleBudgetTracker cycle={{ ...baseCycle, allocatedTotal: 0 }} />, { wrapper: Wrapper });
    const bar = screen.getByTestId("budget-progress-bar");
    expect(bar.style.width).toBe("0%");
  });

  it("shows warning state at ≥80%", () => {
    render(<BonusCycleBudgetTracker cycle={{ ...baseCycle, allocatedTotal: 85_000 }} />, { wrapper: Wrapper });
    const bar = screen.getByTestId("budget-progress-bar");
    expect(bar.className).toContain("amber");
  });

  it("shows over-budget state at ≥100%", () => {
    render(<BonusCycleBudgetTracker cycle={{ ...baseCycle, allocatedTotal: 110_000 }} />, { wrapper: Wrapper });
    const bar = screen.getByTestId("budget-progress-bar");
    expect(bar.className).toContain("destructive");
  });
});

// ─── ApproveCycleButton ────────────────────────────────────────
describe("ApproveCycleButton", () => {
  const resolvedAllocations: EmployeeAllocation[] = [
    {
      employeeId: "e1",
      employeeName: "Alice",
      targetPercent: 10,
      recommendedAmount: 5000,
      proposedAmount: 5000,
      approvedAmount: 5000,
      status: "APPROVED",
    },
    {
      employeeId: "e2",
      employeeName: "Bob",
      targetPercent: 5,
      recommendedAmount: 2500,
      proposedAmount: 2500,
      approvedAmount: 2500,
      status: "REJECTED",
    },
  ];

  const unresolvedAllocations: EmployeeAllocation[] = [
    {
      employeeId: "e1",
      employeeName: "Alice",
      targetPercent: 10,
      recommendedAmount: 5000,
      proposedAmount: 5000,
      approvedAmount: null,
      status: "PROPOSED",
    },
  ];

  it("is disabled in PLANNING state", () => {
    render(
      <ApproveCycleButton
        cycleId="cy-1"
        cycleStatus="PLANNING"
        allocations={resolvedAllocations}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("approve-cycle-btn")).toBeDisabled();
  });

  it("is disabled in OPEN state", () => {
    render(
      <ApproveCycleButton
        cycleId="cy-1"
        cycleStatus="OPEN"
        allocations={resolvedAllocations}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("approve-cycle-btn")).toBeDisabled();
  });

  it("is enabled in APPROVAL when all resolved", () => {
    render(
      <ApproveCycleButton
        cycleId="cy-1"
        cycleStatus="APPROVAL"
        allocations={resolvedAllocations}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("approve-cycle-btn")).not.toBeDisabled();
  });

  it("is disabled in APPROVAL when not all resolved", () => {
    render(
      <ApproveCycleButton
        cycleId="cy-1"
        cycleStatus="APPROVAL"
        allocations={unresolvedAllocations}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("approve-cycle-btn")).toBeDisabled();
  });

  it("is disabled in DISBURSED state", () => {
    render(
      <ApproveCycleButton
        cycleId="cy-1"
        cycleStatus="DISBURSED"
        allocations={resolvedAllocations}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("approve-cycle-btn")).toBeDisabled();
  });
});

// ─── CompStatementDownloadButton ────────────────────────────────
describe("CompStatementDownloadButton", () => {
  it("renders download button", () => {
    render(<CompStatementDownloadButton employeeId="e1" />);
    expect(screen.getByTestId("comp-statement-download-btn")).toBeDefined();
    expect(screen.getByText("Download Statement")).toBeDefined();
  });
});

// ─── Allocation Schemas ────────────────────────────────────────
describe("allocation schemas", () => {
  it("proposeAllocationSchema requires positive amount", () => {
    const result = proposeAllocationSchema.safeParse({
      cycleId: "550e8400-e29b-41d4-a716-446655440000",
      employeeId: "550e8400-e29b-41d4-a716-446655440001",
      proposedAmount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("proposeAllocationSchema accepts valid payload", () => {
    const result = proposeAllocationSchema.safeParse({
      cycleId: "550e8400-e29b-41d4-a716-446655440000",
      employeeId: "550e8400-e29b-41d4-a716-446655440001",
      proposedAmount: 5000.0,
    });
    expect(result.success).toBe(true);
  });

  it("approveAllocationSchema rejects zero amount", () => {
    const result = approveAllocationSchema.safeParse({
      cycleId: "550e8400-e29b-41d4-a716-446655440000",
      employeeId: "550e8400-e29b-41d4-a716-446655440001",
      approvedAmount: 0,
    });
    expect(result.success).toBe(false);
  });
});
