import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaveBalanceWidget } from "@/features/leave/components/LeaveBalanceWidget";

const defaultBalance = {
  leaveTypeId: "1",
  leaveTypeName: "Annual Leave",
  year: 2024,
  entitled: 15,
  used: 2.5,
  carriedForward: 0,
  closing: 12.5,
};

function mockBalance(overrides: Partial<typeof defaultBalance> = {}) {
  return { ...defaultBalance, ...overrides };
}

// Module-level mutable mock data
let mockData: ReturnType<typeof mockBalance>[] = [];
let mockLoading = false;
let mockError: unknown = null;
const mockRefetch = vi.fn();

vi.mock("@/features/leave/api/leaveApi", () => ({
  useLeaveBalances: () => ({
    data: mockData,
    isLoading: mockLoading,
    error: mockError,
    refetch: mockRefetch,
  }),
}));

describe("LeaveBalanceWidget — balance display", () => {
  it("renders a card for each leave type in the response", () => {
    mockData = [
      mockBalance({ leaveTypeName: "Annual Leave" }),
      mockBalance({ leaveTypeName: "Sick Leave", leaveTypeId: "2" }),
      mockBalance({ leaveTypeName: "Personal Leave", leaveTypeId: "3" }),
    ];

    render(<LeaveBalanceWidget />);
    const cards = screen.getAllByTestId("balance-card");
    expect(cards).toHaveLength(3);
  });

  it("displays closing days as the primary number", () => {
    mockData = [mockBalance({ closing: 12.5 })];

    render(<LeaveBalanceWidget />);
    expect(screen.getByText("12.5")).toBeInTheDocument();
    expect(screen.getByText(/days available/i)).toBeInTheDocument();
  });

  it("shows zero without negative sign when closing is 0", () => {
    mockData = [mockBalance({ closing: 0, used: 15, entitled: 15 })];

    render(<LeaveBalanceWidget />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("clamps and displays 0 when closing is negative (defensive guard)", () => {
    mockData = [mockBalance({ closing: -2 })];

    render(<LeaveBalanceWidget />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("-2")).not.toBeInTheDocument();
  });

  it("applies amber styling when closing is between 1 and 5 inclusive", () => {
    mockData = [mockBalance({ closing: 3 })];

    render(<LeaveBalanceWidget />);
    const card = screen.getByTestId("balance-card");
    expect(card.getAttribute("data-status")).toBe("low");
  });

  it("applies danger styling when closing is 0", () => {
    mockData = [mockBalance({ closing: 0 })];

    render(<LeaveBalanceWidget />);
    const card = screen.getByTestId("balance-card");
    expect(card.getAttribute("data-status")).toBe("empty");
  });

  it("does not show carry-forward row when carriedForward is 0", () => {
    mockData = [mockBalance({ carriedForward: 0 })];

    render(<LeaveBalanceWidget />);
    expect(screen.queryByText(/carry-forward/i)).not.toBeInTheDocument();
  });

  it("shows carry-forward row when carriedForward > 0", () => {
    mockData = [mockBalance({ carriedForward: 3, closing: 15.5 })];

    render(<LeaveBalanceWidget />);
    expect(screen.getByText(/carry-forward/i)).toBeInTheDocument();
  });
});
