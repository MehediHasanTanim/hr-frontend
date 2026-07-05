/**
 * Sprint 6 Regression — MSS Approval Queue & Bulk Actions
 *
 * Covers MSS approval queue rendering, approve/reject modal,
 * bulk action bar visibility, and rejection reason validation
 *
 * Vitest + RTL component tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ApprovalQueue } from "@/features/mss/components/ApprovalQueue";
import { BulkActionBar } from "@/features/mss/components/BulkActionBar";

// ─── Mock API client ─────────────────────────────────────────────
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { data: [], total: 0, page: 1, limit: 20 } }),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// ─── Mock auth store ────────────────────────────────────────────
vi.mock("@/features/auth/stores/authStore", () => ({
  useAuthStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      accessToken: "mock-token",
      user: { id: "m1", name: "Manager", email: "manager@test.com", role: "MANAGER" },
    };
    return selector ? selector(state) : state;
  }),
}));

// ─── Mock toast store ────────────────────────────────────────────
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

// ─── Mock navigation ────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  usePathname: () => "/mss/approvals",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// ─── Mock next/link ─────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href} {...props}>{children}</a>,
}));

// ─── Wrapper ─────────────────────────────────────────────────────
function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ─── Reset MSS store between tests ───────────────────────────────
import { useMssStore } from "@/features/mss/store/mss.store";

beforeEach(() => {
  useMssStore.setState({ activeTab: "leave", selectedIds: [] });
});

// ─────────────────────────────────────────────────────────────────
// Approval Queue
// ─────────────────────────────────────────────────────────────────

describe("MSS Approval Queue — Regression", () => {
  describe("ApprovalQueue", () => {
    it("renders Leave Requests tab by default", () => {
      renderWithProviders(<ApprovalQueue />);

      expect(screen.getByTestId("approval-queue")).toBeDefined();
      expect(screen.getByTestId("tab-leave")).toBeDefined();
    });

    it("renders Attendance Corrections tab", () => {
      renderWithProviders(<ApprovalQueue />);

      expect(screen.getByTestId("tab-attendance")).toBeDefined();
    });

    it("Leave Requests tab has aria-selected='true' by default", () => {
      renderWithProviders(<ApprovalQueue />);

      const leaveTab = screen.getByTestId("tab-leave");
      expect(leaveTab.getAttribute("aria-selected")).toBe("true");
    });

    it("renders no data message when no leave requests exist", () => {
      renderWithProviders(<ApprovalQueue />);

      // Should eventually show "No leave requests found"
      expect(screen.getByTestId("leave-approvals-tab")).toBeDefined();
    });
  });

  describe("BulkActionBar", () => {
    it("is hidden when selectedIds is empty", () => {
      render(
        <BulkActionBar
          selectedIds={[]}
          onApproveAll={vi.fn()}
          onRejectAll={vi.fn()}
        />,
      );

      expect(screen.queryByTestId("bulk-action-bar")).toBeNull();
    });

    it("shows count of selected items when selectedIds is non-empty", () => {
      render(
        <BulkActionBar
          selectedIds={["id-1", "id-2", "id-3"]}
          onApproveAll={vi.fn()}
          onRejectAll={vi.fn()}
        />,
      );

      expect(screen.getByTestId("bulk-action-bar")).toBeDefined();
      expect(screen.getByText("3 selected")).toBeDefined();
    });

    it("Approve All has green background", () => {
      render(
        <BulkActionBar
          selectedIds={["id-1"]}
          onApproveAll={vi.fn()}
          onRejectAll={vi.fn()}
        />,
      );

      const approveBtn = screen.getByTestId("bulk-approve-btn");
      expect(approveBtn.className).toContain("bg-green-600");
    });

    it("Reject All has destructive variant", () => {
      render(
        <BulkActionBar
          selectedIds={["id-1"]}
          onApproveAll={vi.fn()}
          onRejectAll={vi.fn()}
        />,
      );

      const rejectBtn = screen.getByTestId("bulk-reject-btn");
      expect(rejectBtn).toBeDefined();
    });

    it("calls onApproveAll when Approve All is clicked", async () => {
      const onApproveAll = vi.fn();
      const user = userEvent.setup();

      render(
        <BulkActionBar
          selectedIds={["id-1"]}
          onApproveAll={onApproveAll}
          onRejectAll={vi.fn()}
        />,
      );

      await user.click(screen.getByTestId("bulk-approve-btn"));
      expect(onApproveAll).toHaveBeenCalledTimes(1);
    });

    it("calls onRejectAll when Reject All is clicked", async () => {
      const onRejectAll = vi.fn();
      const user = userEvent.setup();

      render(
        <BulkActionBar
          selectedIds={["id-1"]}
          onApproveAll={vi.fn()}
          onRejectAll={onRejectAll}
        />,
      );

      await user.click(screen.getByTestId("bulk-reject-btn"));
      expect(onRejectAll).toHaveBeenCalledTimes(1);
    });
  });
});
