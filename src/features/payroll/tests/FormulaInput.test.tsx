import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormulaInput } from "@/features/payroll/components/FormulaInput";

describe("FormulaInput — live preview", () => {
  it("shows preview result for a valid formula", () => {
    render(
      <FormulaInput
        formula="BASIC * 0.4"
        knownCodes={["BASIC"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/preview.*4,000/i)).toBeInTheDocument();
  });

  it("shows preview with correct sample value label", () => {
    render(
      <FormulaInput
        formula="BASIC * 0.4"
        knownCodes={["BASIC"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/basic = ₹10,000/i)).toBeInTheDocument();
  });

  it('shows "Invalid formula" when formula has syntax error', () => {
    render(
      <FormulaInput
        formula="BASIC **** 0.4"
        knownCodes={["BASIC"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/invalid formula/i)).toBeInTheDocument();
  });

  it('shows "Invalid formula" when formula references unknown code', () => {
    render(
      <FormulaInput
        formula="UNKNOWN_CODE * 0.5"
        knownCodes={["BASIC"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/invalid formula/i)).toBeInTheDocument();
  });

  it("shows no preview when formula is empty", () => {
    render(
      <FormulaInput formula="" knownCodes={["BASIC"]} onChange={vi.fn()} />,
    );
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
  });

  it("calls onChange when user types in the formula input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FormulaInput formula="" knownCodes={["BASIC"]} onChange={onChange} />,
    );
    const input = screen.getByPlaceholderText(/e\.g\. BASIC/i);
    await user.type(input, "BASIC");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders external error message when error prop is provided", () => {
    render(
      <FormulaInput
        formula=""
        knownCodes={["BASIC"]}
        onChange={vi.fn()}
        error="Formula is required"
      />,
    );
    expect(screen.getByText("Formula is required")).toBeInTheDocument();
  });

  it("preview shows min function result correctly", () => {
    render(
      <FormulaInput
        formula="min(BASIC * 0.12, 1800)"
        knownCodes={["BASIC"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/preview.*1,200/i)).toBeInTheDocument();
  });

  it("preview shows min cap correctly when result exceeds cap", () => {
    render(
      <FormulaInput
        formula="min(BASIC * 0.12, 1800)"
        knownCodes={["BASIC"]}
        sampleValue={50000}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/preview.*1,800/i)).toBeInTheDocument();
  });
});
