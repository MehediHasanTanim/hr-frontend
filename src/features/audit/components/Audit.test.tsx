import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuditLogFilters } from "@/features/audit/components/AuditLogFilters";
import { AuditLogTable } from "@/features/audit/components/AuditLogTable";
import { AuditDiffDrawer } from "@/features/audit/components/AuditDiffDrawer";

// ─── Setup ───────────────────────────────────────────────────────
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// ─── AuditLogFilters ─────────────────────────────────────────────
describe("AuditLogFilters", () => {
  it("renders filter fields", () => {
    const onChange = vi.fn();
    renderWithQueryClient(
      <AuditLogFilters filters={{}} onChange={onChange} />,
    );

    expect(screen.getByLabelText(/actor/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Action")).toBeInTheDocument();
    expect(screen.getByLabelText("Resource Type")).toBeInTheDocument();
    expect(screen.getByLabelText(/date from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date to/i)).toBeInTheDocument();
  });

  it("shows Clear filters button when filters are active", () => {
    const onChange = vi.fn();
    renderWithQueryClient(
      <AuditLogFilters
        filters={{ action: "LOGIN_SUCCESS" }}
        onChange={onChange}
      />,
    );

    expect(
      screen.getByRole("button", { name: /clear filters/i }),
    ).toBeInTheDocument();
  });

  it("does not show Clear filters when no filters", () => {
    const onChange = vi.fn();
    renderWithQueryClient(
      <AuditLogFilters filters={{}} onChange={onChange} />,
    );

    expect(
      screen.queryByRole("button", { name: /clear filters/i }),
    ).not.toBeInTheDocument();
  });
});

// ─── AuditLogTable ───────────────────────────────────────────────
describe("AuditLogTable", () => {
  const mockData = [
    {
      id: "audit-1",
      actorId: "user-1",
      actorName: "John Admin",
      action: "POLICY_PUBLISHED",
      resourceType: "policy",
      resourceId: "pol-1",
      metadata: {
        before: { status: "DRAFT" },
        after: { status: "PUBLISHED" },
      },
      ipAddress: "192.168.1.1",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ];

  it("renders table with data", () => {
    renderWithQueryClient(
      <AuditLogTable
        data={mockData}
        isLoading={false}
        total={1}
        page={1}
        limit={20}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("John Admin")).toBeInTheDocument();
    expect(screen.getByText("POLICY_PUBLISHED")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    renderWithQueryClient(
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

  it("renders pagination", () => {
    renderWithQueryClient(
      <AuditLogTable
        data={mockData}
        isLoading={false}
        total={50}
        page={2}
        limit={20}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("prev button disabled on page 1", () => {
    renderWithQueryClient(
      <AuditLogTable
        data={mockData}
        isLoading={false}
        total={50}
        page={1}
        limit={20}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /prev/i }),
    ).toBeDisabled();
  });

  it("skeleton shows while loading", () => {
    const { container } = renderWithQueryClient(
      <AuditLogTable
        data={undefined}
        isLoading={true}
        total={0}
        page={1}
        limit={20}
        onPageChange={vi.fn()}
      />,
    );

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ─── AuditDiffDrawer ─────────────────────────────────────────────
describe("AuditDiffDrawer", () => {
  it("renders null when no entry", () => {
    const { container } = render(
      <AuditDiffDrawer entry={null} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders diff drawer with before/after", () => {
    const entry = {
      id: "audit-1",
      actorId: "user-1",
      actorName: "John Admin",
      action: "POLICY_PUBLISHED",
      resourceType: "policy",
      resourceId: "pol-1",
      metadata: {
        before: { status: "DRAFT", version: 1 },
        after: { status: "PUBLISHED", version: 2 },
      },
      ipAddress: "192.168.1.1",
      createdAt: "2024-01-15T10:00:00Z",
    };

    render(<AuditDiffDrawer entry={entry} onClose={vi.fn()} />);

    expect(screen.getByText("POLICY_PUBLISHED")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
  });

  it("renders raw JSON for flat metadata", () => {
    const entry = {
      id: "audit-2",
      actorId: "user-1",
      actorName: "Jane",
      action: "LOGIN_SUCCESS",
      resourceType: null,
      resourceId: null,
      metadata: { browser: "Chrome", os: "macOS" },
      ipAddress: "10.0.0.1",
      createdAt: "2024-01-15T11:00:00Z",
    };

    render(<AuditDiffDrawer entry={entry} onClose={vi.fn()} />);

    expect(screen.getByText(/Chrome/)).toBeInTheDocument();
    expect(screen.getByText(/macOS/)).toBeInTheDocument();
  });
});
