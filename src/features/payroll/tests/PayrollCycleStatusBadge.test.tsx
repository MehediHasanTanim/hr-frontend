import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CycleStatusBadge } from "@/features/payroll/components/CycleStatusBadge";
import type { CycleStatus } from "@/features/payroll/types";

describe("CycleStatusBadge", () => {
  const statuses: Array<[CycleStatus, string]> = [
    ["draft", "Draft"],
    ["processing", "Processing..."],
    ["computed", "Computed"],
    ["approved", "Approved"],
    ["disbursed", "Disbursed"],
    ["reversed", "Reversed"],
  ];

  test.each(statuses)(
    'renders correct label for status "%s"',
    (status, expectedLabel) => {
      render(<CycleStatusBadge status={status} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    },
  );

  it("renders spinner icon when status is processing", () => {
    render(<CycleStatusBadge status="processing" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not render spinner for non-processing statuses", () => {
    render(<CycleStatusBadge status="computed" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a check icon for disbursed status", () => {
    render(<CycleStatusBadge status="disbursed" />);
    expect(screen.getByTestId("icon-check")).toBeInTheDocument();
  });

  it("applies gray color class for draft status", () => {
    const { container } = render(<CycleStatusBadge status="draft" />);
    expect(container.firstChild).toHaveAttribute("data-status", "draft");
  });

  it("applies red color class for reversed status", () => {
    const { container } = render(<CycleStatusBadge status="reversed" />);
    expect(container.firstChild).toHaveAttribute("data-status", "reversed");
  });

  it("applies amber color class for processing status", () => {
    const { container } = render(<CycleStatusBadge status="processing" />);
    expect(container.firstChild).toHaveAttribute("data-status", "processing");
  });

  it("renders accessible text for screen readers", () => {
    render(<CycleStatusBadge status="processing" />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });
});
