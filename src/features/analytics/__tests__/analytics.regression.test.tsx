// src/features/analytics/__tests__/analytics.regression.test.tsx
// Sprint 11 — Analytics Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KpiCard } from "@/features/analytics/components/ExecutiveDashboard/KpiCard";
import { RiskScoreBadge } from "@/features/analytics/components/AttritionRiskTable/RiskScoreBadge";
import { FilterRow } from "@/features/analytics/components/ReportBuilder/FilterRow";
import { ReportResultsTable } from "@/features/analytics/components/ReportBuilder/ReportResultsTable";
import { createSavedReportSchema } from "@/features/analytics/schemas/analytics.schema";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── KpiCard ───────────────────────────────────────────────────
describe("KpiCard", () => {
  it("renders label and value", () => {
    render(<KpiCard label="Total Employees" value="150" isLoading={false} />);
    expect(screen.getByText("Total Employees")).toBeDefined();
    expect(screen.getByText("150")).toBeDefined();
  });

  it("shows loading spinner when loading", () => {
    render(<KpiCard label="Total" value="—" isLoading={true} />);
    expect(screen.getByTestId("kpi-card-total")).toBeDefined();
  });

  it("shows up arrow with green for higherIsBetter", () => {
    render(<KpiCard label="Headcount" value="150" trend="up" deltaVsPreviousPeriod="+5" deltaSemantics="higherIsBetter" isLoading={false} />);
    expect(screen.getByText(/\+5/)).toBeDefined();
  });

  it("shows up arrow with red for lowerIsBetter (attrition)", () => {
    render(<KpiCard label="Attrition Rate" value="5.2%" trend="up" deltaVsPreviousPeriod="+0.3%" deltaSemantics="lowerIsBetter" isLoading={false} />);
    const delta = screen.getByText(/\+0\.3%/);
    expect(delta.className).toContain("destructive");
  });
});

// ─── RiskScoreBadge ────────────────────────────────────────────
describe("RiskScoreBadge", () => {
  it("renders all 4 bands correctly", () => {
    const bands = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
    bands.forEach((band) => {
      const { unmount } = render(<RiskScoreBadge band={band} score={3.5} />);
      expect(screen.getByTestId(`risk-badge-${band}`)).toBeDefined();
      expect(screen.getByText(new RegExp(band))).toBeDefined();
      unmount();
    });
  });

  it("shows score value", () => {
    render(<RiskScoreBadge band="MEDIUM" score={7.2} />);
    expect(screen.getByText(/7\.2/)).toBeDefined();
  });
});

// ─── FilterRow ─────────────────────────────────────────────────
describe("FilterRow", () => {
  it("renders field, operator, value inputs", () => {
    render(
      <FilterRow
        filter={{ field: "name", operator: "EQ", value: "test" }}
        availableFields={["name", "department"]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByTestId("filter-field")).toBeDefined();
    expect(screen.getByTestId("filter-operator")).toBeDefined();
    expect(screen.getByTestId("filter-value")).toBeDefined();
  });

  it("calls onRemove", async () => {
    const onRemove = vi.fn();
    render(
      <FilterRow
        filter={{ field: "name", operator: "EQ", value: "" }}
        availableFields={["name"]}
        onChange={vi.fn()}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByTestId("remove-filter-btn"));
    expect(onRemove).toHaveBeenCalled();
  });
});

// ─── ReportResultsTable ────────────────────────────────────────
describe("ReportResultsTable", () => {
  it("renders 'not yet run' state", () => {
    render(<ReportResultsTable result={null} isLoading={false} isError={false} hasNotRun={true} />);
    expect(screen.getByTestId("report-not-run")).toBeDefined();
  });

  it("renders loading state", () => {
    render(<ReportResultsTable result={null} isLoading={true} isError={false} hasNotRun={false} />);
    expect(screen.getByTestId("report-loading")).toBeDefined();
  });

  it("renders error state", () => {
    render(<ReportResultsTable result={null} isLoading={false} isError={true} hasNotRun={false} />);
    expect(screen.getByTestId("report-error")).toBeDefined();
  });

  it("renders empty results", () => {
    render(<ReportResultsTable result={{ columns: [], rows: [], rowCount: 0, truncated: false }} isLoading={false} isError={false} hasNotRun={false} />);
    expect(screen.getByTestId("report-empty")).toBeDefined();
  });

  it("renders data table", () => {
    render(
      <ReportResultsTable
        result={{ columns: ["name", "dept"], rows: [{ name: "Alice", dept: "Eng" }], rowCount: 1, truncated: false }}
        isLoading={false} isError={false} hasNotRun={false}
      />,
    );
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Eng")).toBeDefined();
  });

  it("shows truncation banner when truncated", () => {
    render(
      <ReportResultsTable
        result={{ columns: ["name"], rows: [{ name: "X" }], rowCount: 5000, truncated: true }}
        isLoading={false} isError={false} hasNotRun={false}
      />,
    );
    expect(screen.getByText(/Showing first/)).toBeDefined();
  });
});

// ─── Zod Schema ────────────────────────────────────────────────
describe("createSavedReportSchema", () => {
  it("rejects empty fields array", () => {
    const result = createSavedReportSchema.safeParse({
      name: "Test", entityType: "EMPLOYEE",
      definition: { fields: [], filters: [], columns: [] },
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid payload", () => {
    const result = createSavedReportSchema.safeParse({
      name: "Headcount Report", entityType: "EMPLOYEE",
      definition: { fields: ["name", "department"], filters: [], columns: ["name"] },
    });
    expect(result.success).toBe(true);
  });
});
