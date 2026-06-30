import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";

// ─── Mocks ───────────────────────────────────────────────────────
const mockMarkReadMutate = vi.fn();
const mockMarkAllReadMutate = vi.fn();

vi.mock("@/features/notifications/hooks/useNotifications", () => ({
  useNotifications: () => ({
    data: {
      data: [
        {
          id: "notif-1",
          type: "POLICY_PUBLISHED",
          title: "New Policy Published",
          body: "Code of Conduct has been updated",
          metadata: null,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "notif-2",
          type: "PAYSLIP_READY",
          title: "Payslip Ready",
          body: "Your January payslip is ready",
          metadata: null,
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 2,
      unreadCount: 1,
    },
    isLoading: false,
  }),
  useMarkRead: () => ({
    mutate: mockMarkReadMutate,
    isPending: false,
  }),
  useMarkAllRead: () => ({
    mutate: mockMarkAllReadMutate,
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// ─── Setup ───────────────────────────────────────────────────────
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  mockMarkReadMutate.mockReset();
  mockMarkAllReadMutate.mockReset();
});

// ─── NotificationBell ────────────────────────────────────────────
describe("NotificationBell", () => {
  it("renders bell button", () => {
    renderWithQueryClient(<NotificationBell />);
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("renders unread badge with correct count", () => {
    renderWithQueryClient(<NotificationBell />);
    const badge = screen.getByText("1");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-red-500");
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<NotificationBell />);

    await user.click(
      screen.getByRole("button", { name: /notifications/i }),
    );

    expect(screen.getByText("New Policy Published")).toBeInTheDocument();
    expect(screen.getByText("Payslip Ready")).toBeInTheDocument();
  });
});

// ─── NotificationItem ────────────────────────────────────────────
describe("NotificationItem", () => {
  it("marks read on click when unread", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithQueryClient(
      <NotificationItem
        notification={{
          id: "notif-1",
          type: "POLICY_PUBLISHED",
          title: "New Policy",
          body: "Policy body",
          metadata: null,
          isRead: false,
          createdAt: new Date().toISOString(),
        }}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByText("New Policy"));
    expect(mockMarkReadMutate).toHaveBeenCalledWith("notif-1");
  });

  it("shows relative time", () => {
    const onNavigate = vi.fn();
    renderWithQueryClient(
      <NotificationItem
        notification={{
          id: "notif-1",
          type: "POLICY_PUBLISHED",
          title: "New Policy",
          body: "Policy body",
          metadata: null,
          isRead: false,
          createdAt: new Date().toISOString(),
        }}
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });
});
