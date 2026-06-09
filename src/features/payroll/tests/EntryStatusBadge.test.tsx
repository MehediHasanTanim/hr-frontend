import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EntryStatusBadge } from "@/features/payroll/components/EntryStatusBadge";
import type { EntryStatus } from "@/features/payroll/types";

describe("EntryStatusBadge", () => {
  const statusCases: Array<{ status: EntryStatus; expectedLabel: string }> = [
    { status: "computed", expectedLabel: "Computed" },
    { status: "approved", expectedLabel: "Approved" },
    { status: "disbursed", expectedLabel: "Disbursed" },
    { status: "held", expectedLabel: "On hold" },
    { status: "reversed", expectedLabel: "Reversed" },
  ];

  it.each(statusCases)(
    'renders correct label for "%s" status',
    ({ status, expectedLabel }) => {
      render(<EntryStatusBadge status={status} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    },
  );

  it("renders check icon for disbursed status", () => {
    render(<EntryStatusBadge status="disbursed" />);
    expect(screen.getByTestId("icon-check")).toBeInTheDocument();
  });

  it("renders alert icon for held status", () => {
    render(<EntryStatusBadge status="held" />);
    expect(screen.getByText("On hold")).toBeInTheDocument();
  });

  it("applies data-status attribute correctly", () => {
    const { container } = render(<EntryStatusBadge status="computed" />);
    expect(container.firstChild).toHaveAttribute("data-status", "computed");
  });

  it("applies blue class for computed status", () => {
    const { container } = render(<EntryStatusBadge status="computed" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-blue-100");
  });

  it("applies green class for approved status", () => {
    const { container } = render(<EntryStatusBadge status="approved" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-green-100");
  });

  it("applies red class for reversed status", () => {
    const { container } = render(<EntryStatusBadge status="reversed" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-red-100");
  });

  it("applies amber class for held status", () => {
    const { container } = render(<EntryStatusBadge status="held" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-amber-100");
  });
});
