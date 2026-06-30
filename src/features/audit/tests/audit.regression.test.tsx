/**
 * Regression tests for the Audit Log module.
 * Tests AuditLogViewer, AuditLogFilters, AuditLogTable, AuditDiffDrawer integration.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuditLogViewer } from "@/features/audit/components/AuditLogViewer";
import { AuditLogFilters } from "@/features/audit/components/AuditLogFilters";
import { AuditLogTable } from "@/features/audit/components/AuditLogTable";
import { AuditDiffDrawer } from "@/features/audit/components/AuditDiffDrawer";
import { AuditLogFilters as AuditLogFiltersType } from "@/features/audit/types/audit.types";

// ─── Mocks ───────────────────────────────────────────────────────
const mockAuditData = {
  data: [
    {
      id: "audit-1",
      actorId: "user-1",
      actorName: "Admin User",
      action: "POLICY_PUBLISHED",
      resourceType: "policy",
      resourceId: "pol-1",
      metadata: {
        before: { status: "DRAFT", version: 1 },
        after: { status: "PUBLISHED", version: 2 },
      },
      ipAddress: "192.168.1.1",
      createdAt: "2025-06-15T10:00:00Z",
    },
    {
      id: "audit-2",
      actorId: "user-2",
      actorName: "Jane Smith",
      action: "LOGIN_SUCCESS",
      resourceType: null,
      resourceId: null,
      metadata: { browser: "Chrome", os: "macOS" },
      ipAddress: "10.0.0.1",
      createdAt: "2025-06-15T09:30:00Z",
    },
    {
      id: "audit-3",
      actorId: "user-3",
      actorName: null,
      action: "ESIGN_DOCUMENT_SIGNED",
      resourceType: "esign_request",
      resourceId: "esign-1",
      metadata: null,
      ipAddress: null,
      createdAt: "2025-06-14T14:00:00Z",
    },
  ],
  total: 3,
  page: 1,
  limit: 20,
};

vi.mock("@/features/audit/hooks/useAuditLogs", () => ({
  useAuditLogs: () => ({
    data: mockAuditData,
    isLoading: false,
  }),
}));

vi.mock("@/features/audit/api/audit.api", () => ({
  exportAuditLogs: vi.fn().mockResolvedValue({
    jobId: "job-1",
    message: "Export queued",
  }),
}));

// ─── Setup ───────────────────────────────────────────────────────
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════
describe("Audit Log Regression Tests", () => {
  describe("AuditLogViewer", () => {
    it("renders page heading and export button", () => {
      renderWithProviders(
        <AuditLogViewer initialData={mockAuditData} />,
      );

      expect(screen.getByText("Audit Logs")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /export csv/i }),
      ).toBeInTheDocument();
    });

    it("renders filter component with all fields", () => {
      renderWithProviders(
        <AuditLogViewer initialData={mockAuditData} />,
      );

      expect(screen.getByLabelText(/actor/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Action")).toBeInTheDocument();
      expect(screen.getByLabelText("Resource Type")).toBeInTheDocument();
      expect(screen.getByLabelText(/date from/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date to/i)).toBeInTheDocument();
    });

    it("renders table with audit entries", () => {
      renderWithProviders(
        <AuditLogViewer initialData={mockAuditData} />,
      );

      // POLICY_PUBLISHED and LOGIN_SUCCESS appear in both filter options and table
      const policyActions = screen.getAllByText("POLICY_PUBLISHED");
      expect(policyActions.length).toBeGreaterThanOrEqual(2);
      const loginActions = screen.getAllByText("LOGIN_SUCCESS");
      expect(loginActions.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });
  });

  describe("AuditLogFilters", () => {
    it("all filter fields visible", () => {
      renderWithProviders(
        <AuditLogFilters filters={{}} onChange={vi.fn()} />,
      );

      expect(screen.getByLabelText(/actor/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Action")).toBeInTheDocument();
      expect(screen.getByLabelText("Resource Type")).toBeInTheDocument();
      expect(screen.getByLabelText(/date from/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date to/i)).toBeInTheDocument();
    });

    it("clear filters button hidden when no filters active", () => {
      renderWithProviders(
        <AuditLogFilters filters={{}} onChange={vi.fn()} />,
      );

      expect(
        screen.queryByRole("button", { name: /clear filters/i }),
      ).not.toBeInTheDocument();
    });

    it("clear filters button visible when filter active", () => {
      renderWithProviders(
        <AuditLogFilters
          filters={{ action: "LOGIN_SUCCESS" }}
          onChange={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: /clear filters/i }),
      ).toBeInTheDocument();
    });
  });

  describe("AuditLogTable", () => {
    it("renders all columns correctly", () => {
      renderWithProviders(
        <AuditLogTable
          data={[mockAuditData.data[0]!]}
          isLoading={false}
          total={1}
          page={1}
          limit={20}
          onPageChange={vi.fn()}
        />,
      );

      // Timestamp formatted
      expect(screen.getByText(/Jun 2025/)).toBeInTheDocument();

      // Actor name
      expect(screen.getByText("Admin User")).toBeInTheDocument();

      // Action with code styling
      expect(screen.getByText("POLICY_PUBLISHED")).toBeInTheDocument();

      // Resource
      expect(screen.getByText(/policy:/)).toBeInTheDocument();

      // IP
      expect(screen.getByText("192.168.1.1")).toBeInTheDocument();

      // View diff button
      expect(screen.getByRole("button", { name: /view diff/i })).toBeInTheDocument();
    });

    it("shows actor ID fallback when name is null", () => {
      const entryWithoutName = mockAuditData.data[2]!;
      renderWithProviders(
        <AuditLogTable
          data={[entryWithoutName]}
          isLoading={false}
          total={1}
          page={1}
          limit={20}
          onPageChange={vi.fn()}
        />,
      );

      expect(screen.getByText("user-3...")).toBeInTheDocument();
    });

    it("shows '—' for null values", () => {
      const entryWithNulls = mockAuditData.data[2]!;
      renderWithProviders(
        <AuditLogTable
          data={[entryWithNulls]}
          isLoading={false}
          total={1}
          page={1}
          limit={20}
          onPageChange={vi.fn()}
        />,
      );

      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("pagination prev disabled on page 1", () => {
      renderWithProviders(
        <AuditLogTable
          data={[mockAuditData.data[0]!]}
          isLoading={false}
          total={50}
          page={1}
          limit={20}
          onPageChange={vi.fn()}
        />,
      );

      expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    });

    it("pagination shows correct page info", () => {
      renderWithProviders(
        <AuditLogTable
          data={[mockAuditData.data[0]!]}
          isLoading={false}
          total={50}
          page={2}
          limit={20}
          onPageChange={vi.fn()}
        />,
      );

      expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    });

    it("empty state renders when no data", () => {
      renderWithProviders(
        <AuditLogTable
          data={[]}
          isLoading={false}
          total={0}
          page={1}
          limit={20}
          onPageChange={vi.fn()}
        />,
      );

      expect(
        screen.getByText(/no audit log entries match your filters/i),
      ).toBeInTheDocument();
    });
  });

  describe("AuditDiffDrawer", () => {
    it("does not render when entry is null", () => {
      const { container } = render(
        <AuditDiffDrawer entry={null} onClose={vi.fn()} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it("renders two-column diff for before/after metadata", () => {
      const entry = mockAuditData.data[0]!;
      render(<AuditDiffDrawer entry={entry} onClose={vi.fn()} />);

      // Action title
      expect(screen.getByText("POLICY_PUBLISHED")).toBeInTheDocument();

      // Before value with strikethrough (red)
      const draftEl = screen.getByText("DRAFT");
      expect(draftEl).toBeInTheDocument();

      // After value (green)
      expect(screen.getByText("PUBLISHED")).toBeInTheDocument();

      // Actor info
      expect(screen.getByText("Admin User")).toBeInTheDocument();

      // IP address
      expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    });

    it("renders JSON block for flat metadata", () => {
      const entry = mockAuditData.data[1]!;
      render(<AuditDiffDrawer entry={entry} onClose={vi.fn()} />);

      expect(screen.getByText("LOGIN_SUCCESS")).toBeInTheDocument();

      // Should show Chrome and macOS in the JSON block
      const preElement = document.querySelector("pre");
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toContain("Chrome");
      expect(preElement?.textContent).toContain("macOS");
    });

    it("shows 'No additional metadata' when metadata is null", () => {
      const entry = mockAuditData.data[2]!;
      render(<AuditDiffDrawer entry={entry} onClose={vi.fn()} />);

      expect(
        screen.getByText("No additional metadata."),
      ).toBeInTheDocument();
    });
  });
});
