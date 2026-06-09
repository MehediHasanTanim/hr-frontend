import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CycleStatusBadge } from "@/features/payroll/components/CycleStatusBadge";
import type { CycleStatus } from "@/features/payroll/types";

describe("PayrollCycleTable — Status Badge Rendering", () => {
  const statusCases: Array<{
    status: CycleStatus;
    expectedLabel: string;
    description: string;
  }> = [
    { status: "draft", expectedLabel: "Draft", description: "Draft status" },
    { status: "processing", expectedLabel: "Processing...", description: "Processing status" },
    { status: "computed", expectedLabel: "Computed", description: "Computed status" },
    { status: "approved", expectedLabel: "Approved", description: "Approved status" },
    { status: "disbursed", expectedLabel: "Disbursed", description: "Disbursed status" },
    { status: "reversed", expectedLabel: "Reversed", description: "Reversed status" },
  ];

  it.each(statusCases)(
    "renders correct badge text '$expectedLabel' for $description",
    ({ status, expectedLabel }) => {
      render(<CycleStatusBadge status={status} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    },
  );

  it.each(statusCases)(
    "badge has correct data-status attribute for $description",
    ({ status }) => {
      const { container } = render(<CycleStatusBadge status={status} />);
      expect(container.firstChild).toHaveAttribute("data-status", status);
    },
  );

  it("renders spinner icon when status is processing", () => {
    render(<CycleStatusBadge status="processing" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("does not render spinner for non-processing statuses", () => {
    render(<CycleStatusBadge status="computed" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a check icon for disbursed status", () => {
    render(<CycleStatusBadge status="disbursed" />);
    expect(screen.getByTestId("icon-check")).toBeInTheDocument();
  });

  it("does not render check icon for non-disbursed statuses", () => {
    render(<CycleStatusBadge status="approved" />);
    expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
  });

  it("applies correct color class for draft (gray)", () => {
    const { container } = render(<CycleStatusBadge status="draft" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-gray-100");
    expect(el.className).toContain("text-gray-700");
  });

  it("applies correct color class for reversed (red)", () => {
    const { container } = render(<CycleStatusBadge status="reversed" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-red-100");
    expect(el.className).toContain("text-red-700");
  });

  it("applies correct color class for approved (green)", () => {
    const { container } = render(<CycleStatusBadge status="approved" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-green-100");
    expect(el.className).toContain("text-green-700");
  });

  it("applies correct color class for processing (amber)", () => {
    const { container } = render(<CycleStatusBadge status="processing" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-amber-100");
    expect(el.className).toContain("text-amber-700");
  });

  it("renders accessible text for screen readers", () => {
    render(<CycleStatusBadge status="processing" />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it("renders draft status without any icons", () => {
    const { container } = render(<CycleStatusBadge status="draft" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
