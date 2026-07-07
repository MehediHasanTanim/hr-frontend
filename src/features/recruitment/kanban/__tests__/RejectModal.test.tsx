// src/features/recruitment/kanban/__tests__/RejectModal.test.tsx
// Sprint 7 F1 — RejectModal unit tests

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RejectModal } from "../components/RejectModal";

// Mock API
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn().mockResolvedValue({ data: { id: "app-1" } }),
    delete: vi.fn(),
  },
}));

// Mock toast
vi.mock("@/stores/toast.store", () => ({
  useToastStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = {
      toasts: [],
      addToast: vi.fn(),
      dismissToast: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("RejectModal", () => {
  it("renders candidate name in description", () => {
    renderWithProviders(
      <RejectModal
        applicationId="app-1"
        candidateName="Jane Doe"
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeDefined();
  });

  it("blocks submission when reason is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <RejectModal
        applicationId="app-1"
        candidateName="Jane Doe"
        open={true}
        onClose={vi.fn()}
      />,
    );

    // Click submit without filling reason
    await user.click(screen.getByTestId("confirm-reject-btn"));

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByTestId("reject-reason-error")).toBeDefined();
    });
  });

  it("calls onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <RejectModal
        applicationId="app-1"
        candidateName="Jane Doe"
        open={true}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
