/**
 * Sprint 6 Regression — FE-A11Y-001 & FE-A11Y-002: Accessibility
 *
 * FE-A11Y-001: All primary pages pass automated axe-core WCAG 2.1 AA scan
 * FE-A11Y-002: Color is not the only indicator — status badges have text labels
 *
 * Vitest + RTL component tests for accessibility patterns
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { ReportSelector } from "@/features/reports/components/ReportSelector";
import { ReportResultsTable } from "@/features/reports/components/ReportResultsTable";
import { LeaveBalanceWidget } from "@/features/ess/components/LeaveBalanceWidget";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────────────────────────────
// FE-A11Y-001 — axe-core accessibility patterns
// ─────────────────────────────────────────────────────────────────

describe("FE-A11Y-001 — Accessibility: ARIA attributes, labels, and landmarks", () => {
  describe("MetricCard accessibility", () => {
    it("renders with accessible test IDs for automation targeting", () => {
      render(
        <MetricCard
          title="Total Headcount"
          value={150}
          isLoading={false}
          icon={<span>👥</span>}
          colorScheme="blue"
        />,
      );

      const card = screen.getByTestId("metric-card-total-headcount");
      expect(card).toBeDefined();
    });

    it("error state has role='alert'", () => {
      render(
        <MetricCard
          title="Test"
          value={0}
          isError={true}
          isLoading={false}
          icon={<span>⚠️</span>}
          colorScheme="blue"
        />,
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeDefined();
      expect(alert.textContent).toBe("Failed to load");
    });
  });

  describe("ReportSelector accessibility", () => {
    it("report options are keyboard-focusable buttons", () => {
      render(<ReportSelector selected="headcount" onChange={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(7); // 7 report options
    });
  });

  describe("ReportResultsTable accessibility", () => {
    it("table headers have scope='col'", () => {
      const rows = [{ departmentName: "Engineering", headcount: 12 }];

      render(
        <ReportResultsTable rows={rows} isLoading={false} reportKey="headcount" />,
      );

      const ths = screen.getAllByRole("columnheader");
      ths.forEach((th) => {
        expect(th.getAttribute("scope")).toBe("col");
      });
    });

    it("role='status' present on 500-row limit notice", () => {
      const rows = [{ col: "a" }];
      render(
        <ReportResultsTable
          rows={rows}
          isLoading={false}
          reportKey="headcount"
          totalRows={501}
        />,
      );

      const notice = screen.getByRole("status");
      expect(notice.textContent).toContain("Showing first 500 rows");
    });
  });

  describe("LeaveBalanceWidget accessibility", () => {
    it("progress bars have aria attributes", () => {
      const balances = [{ leaveType: "ANNUAL", entitled: 20, taken: 5, remaining: 15 }];

      render(<LeaveBalanceWidget balances={balances} isLoading={false} />);

      const bar = screen.getByRole("progressbar", { name: /ANNUAL/i });
      expect(bar.getAttribute("aria-valuenow")).toBe("5");
      expect(bar.getAttribute("aria-valuemin")).toBe("0");
      expect(bar.getAttribute("aria-valuemax")).toBe("20");
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// FE-A11Y-002 — Color is not the only indicator
// ─────────────────────────────────────────────────────────────────

describe("FE-A11Y-002 — Color is not the only status indicator", () => {
  describe("LeaveBalanceWidget colour thresholds have text context", () => {
    it("green bar displays 'remaining' text alongside colour", () => {
      const balances = [{ leaveType: "ANNUAL", entitled: 20, taken: 5, remaining: 15 }];

      render(<LeaveBalanceWidget balances={balances} isLoading={false} />);

      // Must have text showing remaining days — not just color
      expect(screen.getByText("15")).toBeDefined();
      expect(screen.getByText(/days remaining/i)).toBeDefined();
    });

    it("red bar (>80%) still shows remaining days text", () => {
      const balances = [{ leaveType: "ANNUAL", entitled: 20, taken: 18, remaining: 2 }];

      render(<LeaveBalanceWidget balances={balances} isLoading={false} />);

      // Even when bar is red, text label still communicates the value
      expect(screen.getByText("2")).toBeDefined();
    });
  });

  describe("MetricCard trend arrows are not colour-only", () => {
    it("up trend shows arrow text character alongside color class", () => {
      render(
        <MetricCard
          title="Test"
          value={10}
          trend={{ direction: "up", delta: "+5" }}
          isLoading={false}
          icon={<span>📈</span>}
          colorScheme="green"
        />,
      );

      // Arrow character "↑" should be present (text, not just color)
      const trendEl = screen.getByText(/↑/);
      expect(trendEl).toBeDefined();
    });

    it("down trend shows arrow text character alongside color class", () => {
      render(
        <MetricCard
          title="Test"
          value={10}
          trend={{ direction: "down", delta: "-3" }}
          isLoading={false}
          icon={<span>📉</span>}
          colorScheme="green"
        />,
      );

      const trendEl = screen.getByText(/↓/);
      expect(trendEl).toBeDefined();
    });

    it("flat trend shows dash character alongside color", () => {
      render(
        <MetricCard
          title="Test"
          value={10}
          trend={{ direction: "flat", delta: "No change" }}
          isLoading={false}
          icon={<span>📊</span>}
          colorScheme="green"
        />,
      );

      const trendEl = screen.getByText(/—/);
      expect(trendEl).toBeDefined();
    });
  });

  describe("Error states use icon + text, not just color", () => {
    it("MetricCard error state shows text 'Failed to load'", () => {
      render(
        <MetricCard
          title="Failing"
          value={0}
          isError={true}
          isLoading={false}
          icon={<span>⚠️</span>}
          colorScheme="blue"
        />,
      );

      // Error text should be visible — not just red color
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Failed to load")).toBeDefined();
    });

    it("LeaveBalanceWidget empty state shows text, not just blank", () => {
      render(<LeaveBalanceWidget balances={[]} isLoading={false} />);

      // Text message communicates the state, not just an empty container
      expect(screen.getByText(/No leave entitlements found/i)).toBeDefined();
    });
  });

  describe("Status badges have text labels", () => {
    it("Badge component renders text content alongside styling", () => {
      render(<Badge variant="default">PENDING</Badge>);

      expect(screen.getByText("PENDING")).toBeDefined();
    });

    it("Badge with outline variant still shows text", () => {
      render(<Badge variant="outline">APPROVED</Badge>);

      expect(screen.getByText("APPROVED")).toBeDefined();
    });
  });
});
