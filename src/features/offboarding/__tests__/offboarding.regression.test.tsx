// src/features/offboarding/__tests__/offboarding.regression.test.tsx
// Sprint 11 — Offboarding Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExitRequestStatusStepper } from "@/features/offboarding/components/ExitRequestStatusStepper";
import {
  createExitRequestSchema,
  rejectExitRequestSchema,
  skipChecklistTaskSchema,
} from "@/features/offboarding/schemas/offboarding.schema";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── ExitRequestStatusStepper ─────────────────────────────────
describe("ExitRequestStatusStepper", () => {
  it("renders Submitted as current for SUBMITTED status", () => {
    render(<ExitRequestStatusStepper status="SUBMITTED" />, { wrapper: Wrapper });
    expect(screen.getByTestId("exit-status-stepper")).toBeDefined();
    expect(screen.getByText("Submitted")).toBeDefined();
  });

  it("renders REJECTED with rejection banner", () => {
    render(<ExitRequestStatusStepper status="REJECTED" />, { wrapper: Wrapper });
    expect(screen.getByText(/was rejected/)).toBeDefined();
  });

  it("renders CANCELLED with cancellation banner", () => {
    render(<ExitRequestStatusStepper status="CANCELLED" />, { wrapper: Wrapper });
    expect(screen.getByText(/was cancelled/)).toBeDefined();
  });

  it("all non-terminal states render stepper without error", () => {
    const states = ["SUBMITTED", "PENDING_MANAGER_APPROVAL", "APPROVED", "INTERVIEW_SCHEDULED", "CHECKLIST_IN_PROGRESS", "COMPLETED"] as const;
    states.forEach((status) => {
      const { unmount } = render(<ExitRequestStatusStepper status={status} />, { wrapper: Wrapper });
      expect(screen.getByTestId("exit-status-stepper")).toBeDefined();
      unmount();
    });
  });
});

// ─── Zod Schemas ───────────────────────────────────────────────
describe("offboarding schemas", () => {
  it("createExitRequestSchema rejects past LWD", () => {
    const result = createExitRequestSchema.safeParse({
      employeeId: "550e8400-e29b-41d4-a716-446655440000",
      reasonType: "RESIGNATION",
      requestedLastWorkingDay: "2020-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("createExitRequestSchema accepts valid resignation", () => {
    const result = createExitRequestSchema.safeParse({
      employeeId: "550e8400-e29b-41d4-a716-446655440000",
      reasonType: "RESIGNATION",
      requestedLastWorkingDay: "2099-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejectExitRequestSchema requires reason", () => {
    const result = rejectExitRequestSchema.safeParse({ rejectionReason: "" });
    expect(result.success).toBe(false);
  });

  it("rejectExitRequestSchema accepts valid reason", () => {
    const result = rejectExitRequestSchema.safeParse({ rejectionReason: "Insufficient coverage" });
    expect(result.success).toBe(true);
  });

  it("skipChecklistTaskSchema requires notes", () => {
    const result = skipChecklistTaskSchema.safeParse({ notes: "" });
    expect(result.success).toBe(false);
  });

  it("skipChecklistTaskSchema accepts valid notes", () => {
    const result = skipChecklistTaskSchema.safeParse({ notes: "Task delegated to IT" });
    expect(result.success).toBe(true);
  });
});
