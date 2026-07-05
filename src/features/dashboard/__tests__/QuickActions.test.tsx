// src/features/dashboard/__tests__/QuickActions.test.tsx
// Sprint 6 — QuickActions role-based visibility tests

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickActions } from "../components/QuickActions";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { AuthState } from "@/features/auth/stores/authStore";

// Helper to set auth store state in test
function setRole(role: string | undefined) {
  useAuthStore.setState({
    user: role ? { id: "u1", name: "Test", email: "test@test.com", role } : null,
    accessToken: "mock-token",
  } as AuthState);
}

describe("QuickActions", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null });
  });

  it("Run Payroll button is not rendered for MANAGER role", () => {
    setRole("MANAGER");
    render(<QuickActions />);
    expect(screen.queryByTestId("action-run-payroll")).toBeNull();
  });

  it("Add Employee button is not rendered for MANAGER role", () => {
    setRole("MANAGER");
    render(<QuickActions />);
    expect(screen.queryByTestId("action-add-employee")).toBeNull();
  });

  it("Approve Leaves button is rendered for MANAGER role", () => {
    setRole("MANAGER");
    render(<QuickActions />);
    expect(screen.getByTestId("action-approve-leaves")).toBeDefined();
  });

  it("all buttons are rendered for HR_ADMIN role", () => {
    setRole("HR_ADMIN");
    render(<QuickActions />);
    expect(screen.getByTestId("action-run-payroll")).toBeDefined();
    expect(screen.getByTestId("action-approve-leaves")).toBeDefined();
    expect(screen.getByTestId("action-add-employee")).toBeDefined();
  });

  it("no buttons rendered for EMPLOYEE role", () => {
    setRole("EMPLOYEE");
    render(<QuickActions />);
    expect(screen.queryByTestId("action-run-payroll")).toBeNull();
    expect(screen.queryByTestId("action-approve-leaves")).toBeNull();
    expect(screen.queryByTestId("action-add-employee")).toBeNull();
  });
});
