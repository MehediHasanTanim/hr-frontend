/**
 * Sprint 6 Regression — FE-RPT-001 & FE-RPT-002: Reports & Dashboard KPI cards
 *
 * FE-RPT-001: Pre-built reports — filter, view results, and export
 * FE-RPT-002: HR dashboard — KPI cards display accurate real-time metrics
 *
 * Vitest + RTL component tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReportSelector } from "@/features/reports/components/ReportSelector";
import { ReportResultsTable } from "@/features/reports/components/ReportResultsTable";
import { ExportButton } from "@/features/reports/components/ExportButton";
import { MetricCard, MetricCardSkeleton } from "@/features/dashboard/components/MetricCard";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { QuickActions } from "@/features/dashboard/components/QuickActions";

// ─── Auth store mock ─────────────────────────────────────────────
vi.mock("@/features/auth/stores/authStore", () => ({
  useAuthStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      accessToken: "mock-token",
      user: { id: "u1", name: "HR Admin", email: "hr@test.com", role: "HR_ADMIN" },
    };
    return selector ? selector(state) : state;
  }),
}));

// ─── Toast store mock ────────────────────────────────────────────
vi.mock("@/stores/toast.store", () => ({
  useToastStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      toasts: [],
      addToast: vi.fn(),
      dismissToast: vi.fn(),
      clearToasts: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

// ─── Wrapper ─────────────────────────────────────────────────────
function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ─────────────────────────────────────────────────────────────────
// FE-RPT-001 — Reports
// ─────────────────────────────────────────────────────────────────

describe("FE-RPT-001 — Pre-built reports filter, view, and export", () => {
  describe("ReportSelector", () => {
    it("renders all 7 report options", () => {
      render(<ReportSelector selected="headcount" onChange={vi.fn()} />);

      const reportKeys = [
        "headcount", "attrition", "payroll_summary",
        "leave_utilization", "attendance_summary", "new_hires", "exits",
      ];

      reportKeys.forEach((key) => {
        expect(screen.getByTestId(`report-option-${key}`)).toBeDefined();
      });
    });

    it("highlights the selected report", () => {
      render(<ReportSelector selected="attrition" onChange={vi.fn()} />);

      const selected = screen.getByTestId("report-option-attrition");
      expect(selected.className).toContain("border-primary");
    });

    it("calls onChange when a different report is clicked", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<ReportSelector selected="headcount" onChange={onChange} />);

      await user.click(screen.getByTestId("report-option-attrition"));
      expect(onChange).toHaveBeenCalledWith("attrition");
    });
  });

  describe("ReportResultsTable", () => {
    it("renders empty state before report is run", () => {
      render(
        <ReportResultsTable rows={[]} isLoading={false} reportKey={null} />,
      );

      expect(screen.getByTestId("report-results-empty")).toBeDefined();
      expect(screen.getByText(/Run a report to see results/i)).toBeDefined();
    });

    it("renders skeleton rows while isLoading", () => {
      render(
        <ReportResultsTable rows={[]} isLoading={true} reportKey="headcount" />,
      );

      expect(screen.getByTestId("report-results-loading")).toBeDefined();
    });

    it("derives columns dynamically from first row keys", () => {
      const rows = [
        { departmentName: "Engineering", headcount: 12 },
        { departmentName: "HR", headcount: 4 },
      ];

      render(
        <ReportResultsTable rows={rows} isLoading={false} reportKey="headcount" />,
      );

      expect(screen.getByText("Department Name")).toBeDefined();
      expect(screen.getByText("Headcount")).toBeDefined();
      expect(screen.getByText("12")).toBeDefined();
      expect(screen.getByText("4")).toBeDefined();
    });

    it("shows 500-row limit notice when totalRows > 500", () => {
      const rows = [{ col: "a" }];
      render(
        <ReportResultsTable
          rows={rows}
          isLoading={false}
          reportKey="headcount"
          totalRows={501}
        />,
      );

      expect(
        screen.getByText(/Showing first 500 rows/i),
      ).toBeDefined();
    });

    it("right-aligns numeric columns", () => {
      const rows = [{ name: "Test", count: 42 }];
      render(
        <ReportResultsTable rows={rows} isLoading={false} reportKey="headcount" />,
      );

      const numericCell = screen.getByText("42");
      expect(numericCell.className).toContain("text-right");
    });

    it("formats monetary columns with BDT currency symbol", () => {
      const rows = [{ departmentName: "Eng", totalNetPay: 55250.5 }];
      render(
        <ReportResultsTable rows={rows} isLoading={false} reportKey="payroll_summary" />,
      );

      // Should contain formatted BDT amount
      expect(screen.getByText(/৳/)).toBeDefined();
    });

    it("renders empty state when rows array is empty", () => {
      render(
        <ReportResultsTable rows={[]} isLoading={false} reportKey="headcount" />,
      );

      expect(screen.getByText(/No data found/i)).toBeDefined();
    });
  });

  describe("ExportButton", () => {
    it("button is disabled when savedReportId is null (tooltip shown)", () => {
      renderWithProviders(
        <ExportButton savedReportId={null} format="xlsx" onJobQueued={vi.fn()} />,
      );

      const btn = screen.getByTestId("export-xlsx-btn");
      expect(btn).toBeDefined();
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    it("button is enabled when savedReportId is provided", () => {
      renderWithProviders(
        <ExportButton
          savedReportId="report-123"
          format="xlsx"
          onJobQueued={vi.fn()}
        />,
      );

      const btn = screen.getByTestId("export-xlsx-btn");
      expect(btn.hasAttribute("disabled")).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// FE-RPT-002 — Dashboard KPI Cards
// ─────────────────────────────────────────────────────────────────

describe("FE-RPT-002 — HR dashboard KPI cards", () => {
  describe("MetricCard", () => {
    it("renders value and title when loaded", () => {
      render(
        <MetricCard
          title="Total Employees"
          value={150}
          isLoading={false}
          icon={<span data-testid="icon">👥</span>}
          colorScheme="blue"
        />,
      );

      expect(screen.getByText("Total Employees")).toBeDefined();
      expect(screen.getByText("150")).toBeDefined();
    });

    it("renders skeleton while isLoading is true", () => {
      render(
        <MetricCard
          title="Total Employees"
          value={0}
          isLoading={true}
          icon={<span>👥</span>}
          colorScheme="blue"
        />,
      );

      expect(screen.getByTestId("metric-card-skeleton")).toBeDefined();
    });

    it("renders trend chip with up/down/flat direction", () => {
      const { rerender } = render(
        <MetricCard
          title="New Hires"
          value={3}
          trend={{ direction: "up", delta: "+2 from last month" }}
          isLoading={false}
          icon={<span>📈</span>}
          colorScheme="green"
        />,
      );
      expect(screen.getByText("+2 from last month")).toBeDefined();

      rerender(
        <MetricCard
          title="Exits"
          value={1}
          trend={{ direction: "down", delta: "-1 from last month" }}
          isLoading={false}
          icon={<span>📉</span>}
          colorScheme="red" // 'red' not in ColorScheme type — cast for test
        />,
      );
      expect(screen.getByText("-1 from last month")).toBeDefined();
    });

    it("renders secondary label and value", () => {
      render(
        <MetricCard
          title="Pending Approvals"
          value={5}
          secondaryLabel="Leave requests"
          secondaryValue={5}
          isLoading={false}
          icon={<span>⏳</span>}
          colorScheme="amber"
        />,
      );

      // Text is split across elements — match card content
      const card = screen.getByTestId("metric-card-pending-approvals");
      expect(card.textContent).toContain("Leave requests");
    });

    it("applies correct color scheme class", () => {
      render(
        <MetricCard
          title="Test"
          value={1}
          isLoading={false}
          icon={<span>🎨</span>}
          colorScheme="purple"
        />,
      );

      const card = screen.getByTestId("metric-card-test");
      expect(card.className).toContain("bg-purple-50");
    });

    it("renders error state when isError is true", () => {
      render(
        <MetricCard
          title="Failing Card"
          value={0}
          isError={true}
          isLoading={false}
          icon={<span>⚠️</span>}
          colorScheme="blue"
        />,
      );

      expect(screen.getByText("Failed to load")).toBeDefined();
    });
  });

  describe("MetricCardSkeleton", () => {
    it("renders skeleton placeholder elements", () => {
      render(<MetricCardSkeleton />);

      expect(screen.getByTestId("metric-card-skeleton")).toBeDefined();
    });
  });

  describe("ActivityFeed", () => {
    it("renders up to 10 entries", () => {
      const entries = Array.from({ length: 12 }, (_, i) => ({
        id: `entry-${i}`,
        action: "USER_CREATED",
        actorName: `User ${i}`,
        description: `Created employee #${i}`,
        createdAt: new Date().toISOString(),
      }));

      render(<ActivityFeed entries={entries} isLoading={false} />);

      // Should only show 10 of 12
      const listItems = screen.getByTestId("activity-feed").querySelectorAll("li");
      expect(listItems.length).toBeLessThanOrEqual(10);
    });

    it("renders empty state when no entries", () => {
      render(<ActivityFeed entries={[]} isLoading={false} />);

      expect(screen.getByTestId("activity-feed-empty")).toBeDefined();
      expect(screen.getByText(/No recent activity/i)).toBeDefined();
    });

    it("renders skeleton placeholders while loading", () => {
      render(<ActivityFeed entries={[]} isLoading={true} />);

      expect(screen.getByTestId("activity-feed-loading")).toBeDefined();
    });

    it("uses formatDistanceToNow for timestamps — renders with suffix", () => {
      const entries = [
        {
          id: "e1",
          action: "LOGIN_SUCCESS",
          actorName: "Admin",
          description: "Logged in",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
      ];

      render(<ActivityFeed entries={entries} isLoading={false} />);

      // Should contain "ago" from formatDistanceToNow
      const listText = screen.getByTestId("activity-feed").textContent;
      expect(listText).toContain("about 2 hours ago");
    });
  });

  describe("QuickActions", () => {
    it("Run Payroll button is rendered for HR_ADMIN role", () => {
      renderWithProviders(<QuickActions />);

      expect(screen.getByTestId("action-run-payroll")).toBeDefined();
    });

    it("Add Employee button is rendered for HR_ADMIN role", () => {
      renderWithProviders(<QuickActions />);

      expect(screen.getByTestId("action-add-employee")).toBeDefined();
    });

    it("Approve Leaves button is rendered for HR_ADMIN role", () => {
      renderWithProviders(<QuickActions />);

      expect(screen.getByTestId("action-approve-leaves")).toBeDefined();
    });
  });
});
