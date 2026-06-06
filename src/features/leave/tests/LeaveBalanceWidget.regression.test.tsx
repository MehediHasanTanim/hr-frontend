import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaveBalanceWidget } from "@/features/leave/components/LeaveBalanceWidget";

// ─── Mock API data ───────────────────────────────────────────────
let mockData: Array<{
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitled: number;
  used: number;
  carriedForward: number;
  closing: number;
}> = [];

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

describe("FE-LVE-004 — Leave balance cards display correct values per leave type (RTL)", () => {
  it("renders Annual Leave and Sick Leave cards with correct closing balance breakdown", () => {
    mockData = [
      {
        leaveTypeId: "lt-annual",
        leaveTypeName: "Annual Leave",
        year: 2026,
        entitled: 30,
        used: 3,
        carriedForward: 5,
        closing: 32, // 5 + 30 - 3
      },
      {
        leaveTypeId: "lt-sick",
        leaveTypeName: "Sick Leave",
        year: 2026,
        entitled: 8,
        used: 2,
        carriedForward: 0,
        closing: 6, // 0 + 8 - 2
      },
    ];

    render(<LeaveBalanceWidget />);

    const cards = screen.getAllByTestId("balance-card");

    // Annual Leave card (first)
    const annualCard = cards[0];
    expect(annualCard).toHaveTextContent("Annual Leave");
    expect(annualCard).toHaveTextContent("32");
    expect(annualCard).toHaveTextContent("days available");
    expect(annualCard).toHaveTextContent("30 days");
    expect(annualCard).toHaveTextContent("3 days");
    expect(annualCard).toHaveTextContent(/carry-forward/i);
    expect(annualCard).toHaveTextContent(/carry-forward.*5/i);

    // Sick Leave card (second)
    const sickCard = cards[1];
    expect(sickCard).toHaveTextContent("Sick Leave");
    expect(sickCard).toHaveTextContent("6");
    expect(sickCard).toHaveTextContent("days available");
    expect(sickCard).toHaveTextContent("8 days");
    expect(sickCard).toHaveTextContent("2 days");
    expect(sickCard).not.toHaveTextContent(/carry-forward/i);
  });

  it("shows 0 days when closing is 0 — does not break or show negative", () => {
    mockData = [
      {
        leaveTypeId: "lt-empty",
        leaveTypeName: "Personal Leave",
        year: 2026,
        entitled: 10,
        used: 10,
        carriedForward: 0,
        closing: 0,
      },
    ];

    render(<LeaveBalanceWidget />);

    const card = screen.getByTestId("balance-card");
    expect(card).toHaveAttribute("data-status", "empty");
    expect(card).toHaveTextContent("0");
    expect(card).not.toHaveTextContent("-");
  });

  it("shows skeleton cards during API loading state", () => {
    mockData = [];
    mockLoading = true;

    const { container } = render(<LeaveBalanceWidget />);

    // Skeleton elements are divs with animate-pulse class
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows error message with retry button on API error", () => {
    mockLoading = false;
    mockError = new Error("Network failure");

    render(<LeaveBalanceWidget />);

    expect(screen.getByText("Could not load balances")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
