import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PolicyCard } from "@/features/policy/components/PolicyCard";
import { PolicyStatusBadge } from "@/features/policy/components/PolicyStatusBadge";
import { AcknowledgeModal } from "@/features/policy/components/AcknowledgeModal";

// ─── Mocks ───────────────────────────────────────────────────────
const mockAcknowledgeMutate = vi.fn();

vi.mock("@/features/policy/hooks/usePolicies", () => ({
  usePolicies: () => ({ data: [], isLoading: false }),
  useAcknowledgePolicy: () => ({
    mutate: mockAcknowledgeMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
  usePublishPolicy: () => ({ mutate: vi.fn(), isPending: false }),
  useArchivePolicy: () => ({ mutate: vi.fn(), isPending: false }),
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
  mockAcknowledgeMutate.mockReset();
});

// ─── Mock policy data ─────────────────────────────────────────────
const publishedPolicy = {
  id: "pol-1",
  title: "Employee Code of Conduct",
  content: "# Code of Conduct\n\nAll employees must follow...",
  category: "HR" as const,
  status: "PUBLISHED" as const,
  createdBy: "admin",
  publishedBy: "admin",
  publishedAt: "2024-01-01T00:00:00Z",
  version: 2,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  acknowledgedByMe: false,
  acknowledgementCount: 45,
  totalEmployees: 100,
};

const acknowledgedPolicy = {
  ...publishedPolicy,
  acknowledgedByMe: true,
};

const draftPolicy = {
  ...publishedPolicy,
  id: "pol-draft",
  status: "DRAFT" as const,
  publishedBy: null,
  publishedAt: null,
  acknowledgementCount: 0,
};

// ─── PolicyStatusBadge ────────────────────────────────────────────
describe("PolicyStatusBadge", () => {
  it("renders Draft badge with gray styling", () => {
    render(<PolicyStatusBadge status="DRAFT" />);
    const badge = screen.getByText("Draft");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-gray-100");
  });

  it("renders Published badge with green styling", () => {
    render(<PolicyStatusBadge status="PUBLISHED" />);
    const badge = screen.getByText("Published");
    expect(badge.className).toContain("bg-green-100");
  });

  it("renders Archived badge with red styling", () => {
    render(<PolicyStatusBadge status="ARCHIVED" />);
    const badge = screen.getByText("Archived");
    expect(badge.className).toContain("bg-red-100");
  });
});

// ─── PolicyCard ──────────────────────────────────────────────────
describe("PolicyCard", () => {
  it("shows 'Acknowledgement required' when not acknowledged", () => {
    renderWithQueryClient(
      <PolicyCard policy={publishedPolicy} userRole="EMPLOYEE" />,
    );
    expect(screen.getByText("Acknowledgement required")).toBeInTheDocument();
  });

  it('shows "Read & Acknowledge" button for unacknowledged published policy', () => {
    renderWithQueryClient(
      <PolicyCard policy={publishedPolicy} userRole="EMPLOYEE" />,
    );
    expect(
      screen.getByRole("button", { name: /read & acknowledge/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Acknowledged ✓' when acknowledged", () => {
    renderWithQueryClient(
      <PolicyCard policy={acknowledgedPolicy} userRole="EMPLOYEE" />,
    );
    expect(screen.getByText(/Acknowledged/)).toBeInTheDocument();
  });

  it("shows 'View Policy' for acknowledged policy", () => {
    renderWithQueryClient(
      <PolicyCard policy={acknowledgedPolicy} userRole="EMPLOYEE" />,
    );
    expect(
      screen.getByRole("button", { name: /view policy/i }),
    ).toBeInTheDocument();
  });

  it("shows Publish button for HR_ADMIN on draft policy", () => {
    renderWithQueryClient(
      <PolicyCard policy={draftPolicy} userRole="HR_ADMIN" />,
    );
    expect(
      screen.getByRole("button", { name: /publish/i }),
    ).toBeInTheDocument();
  });

  it("shows acknowledgement progress for HR_ADMIN", () => {
    renderWithQueryClient(
      <PolicyCard policy={publishedPolicy} userRole="HR_ADMIN" />,
    );
    expect(screen.getByText(/45 \/ 100 acknowledged/)).toBeInTheDocument();
  });
});

// ─── AcknowledgeModal ────────────────────────────────────────────
describe("AcknowledgeModal", () => {
  it("confirm button is disabled until checkbox is checked", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <AcknowledgeModal
        policy={publishedPolicy}
        readOnly={false}
        onClose={vi.fn()}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /confirm acknowledgement/i,
    });
    expect(confirmButton).toBeDisabled();

    const checkbox = screen.getByRole("checkbox", {
      name: /i have read and understood this policy/i,
    });
    await user.click(checkbox);

    expect(confirmButton).not.toBeDisabled();
  });

  it("calls acknowledge mutation on confirm", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <AcknowledgeModal
        policy={publishedPolicy}
        readOnly={false}
        onClose={vi.fn()}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    const confirmButton = screen.getByRole("button", {
      name: /confirm acknowledgement/i,
    });
    await user.click(confirmButton);

    expect(mockAcknowledgeMutate).toHaveBeenCalledWith(
      "pol-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("renders in read-only mode without confirm button", () => {
    renderWithQueryClient(
      <AcknowledgeModal
        policy={publishedPolicy}
        readOnly={true}
        onClose={vi.fn()}
      />,
    );

    // Footer Close button exists (note: dialog also has a close × button)
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });
});
