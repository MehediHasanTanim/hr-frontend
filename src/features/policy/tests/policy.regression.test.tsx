/**
 * Regression tests for the Policy module.
 * Tests integration of PolicyLibrary, PolicyCard, AcknowledgeModal.
 * Maps to: FE-DOC-002
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PolicyLibrary } from "@/features/policy/components/PolicyLibrary";
import { PolicyCard } from "@/features/policy/components/PolicyCard";
import { AcknowledgeModal } from "@/features/policy/components/AcknowledgeModal";
import { PolicyStatusBadge } from "@/features/policy/components/PolicyStatusBadge";

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock("@/features/policy/hooks/usePolicies", () => ({
  usePolicies: () => ({
    data: [
      {
        id: "pol-1",
        title: "Code of Conduct v2.0",
        content: "# Code of Conduct\n\nGuidelines...",
        category: "HR",
        status: "PUBLISHED",
        createdBy: "admin",
        publishedBy: "admin",
        publishedAt: "2025-01-01T00:00:00Z",
        version: 2,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        acknowledgedByMe: false,
        acknowledgementCount: 45,
        totalEmployees: 100,
      },
      {
        id: "pol-2",
        title: "IT Security Policy",
        content: "# IT Security\n\nBest practices...",
        category: "IT",
        status: "PUBLISHED",
        createdBy: "admin",
        publishedBy: "admin",
        publishedAt: "2025-03-01T00:00:00Z",
        version: 1,
        createdAt: "2025-03-01T00:00:00Z",
        updatedAt: "2025-03-01T00:00:00Z",
        acknowledgedByMe: true,
        acknowledgementCount: 80,
        totalEmployees: 100,
      },
      {
        id: "pol-3",
        title: "Draft Policy",
        content: "# Draft\n\nWork in progress...",
        category: "HR",
        status: "DRAFT",
        createdBy: "admin",
        publishedBy: null,
        publishedAt: null,
        version: 1,
        createdAt: "2025-06-01T00:00:00Z",
        updatedAt: "2025-06-01T00:00:00Z",
      },
      {
        id: "pol-4",
        title: "Old Archived Policy",
        content: "# Archived\n\nNo longer active...",
        category: "GENERAL",
        status: "ARCHIVED",
        createdBy: "admin",
        publishedBy: "admin",
        publishedAt: "2024-01-01T00:00:00Z",
        version: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-06-01T00:00:00Z",
      },
    ],
    isLoading: false,
  }),
  useAcknowledgePolicy: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  usePublishPolicy: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useArchivePolicy: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
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
describe("Policy Regression Tests", () => {
  describe("FE-DOC-002: Policy Library — HR Admin View", () => {
    it("renders Policy Library heading for HR_ADMIN", () => {
      renderWithProviders(<PolicyLibrary userRole="HR_ADMIN" />);
      expect(screen.getByText("Policy Library")).toBeInTheDocument();
    });

    it("renders all status filter tabs for HR Admin", () => {
      renderWithProviders(<PolicyLibrary userRole="HR_ADMIN" />);

      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Draft" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Published" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Archived" })).toBeInTheDocument();
    });

    it("shows New Policy button for HR Admin", () => {
      renderWithProviders(<PolicyLibrary userRole="HR_ADMIN" />);
      expect(screen.getByRole("button", { name: /new policy/i })).toBeInTheDocument();
    });

    it("shows acknowledgement progress bar for HR Admin", () => {
      renderWithProviders(<PolicyLibrary userRole="HR_ADMIN" />);
      expect(screen.getByText(/45 \/ 100 acknowledged/)).toBeInTheDocument();
    });

    it("shows Publish button on draft policy cards", () => {
      renderWithProviders(<PolicyLibrary userRole="HR_ADMIN" />);
      expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
    });

    it("shows Archive button on published policy cards", () => {
      renderWithProviders(<PolicyLibrary userRole="HR_ADMIN" />);
      const archiveButtons = screen.getAllByRole("button", { name: "Archive" });
      expect(archiveButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("FE-DOC-002: Policy Library — Employee View", () => {
    it("renders Company Policies heading for employee", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);
      expect(screen.getByText("Company Policies")).toBeInTheDocument();
    });

    it("does not show status filter tabs for employee", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);

      // Employee should NOT see Draft/Archived filter tabs
      expect(screen.queryByRole("button", { name: "Draft" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Archived" })).not.toBeInTheDocument();
    });

    it("shows only published policies to employee", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);

      // Published policies visible
      expect(screen.getByText("Code of Conduct v2.0")).toBeInTheDocument();
      expect(screen.getByText("IT Security Policy")).toBeInTheDocument();

      // Draft/Archived should be filtered out
      expect(screen.queryByText("Draft Policy")).not.toBeInTheDocument();
      expect(screen.queryByText("Old Archived Policy")).not.toBeInTheDocument();
    });

    it("shows 'Acknowledgement required' for unacknowledged policy", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);
      expect(screen.getByText(/Acknowledgement required/)).toBeInTheDocument();
    });

    it("shows 'Acknowledged ✓' for acknowledged policy", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);
      expect(screen.getByText(/Acknowledged/)).toBeInTheDocument();
    });

    it("shows 'Read & Acknowledge' for unacknowledged", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);
      expect(
        screen.getByRole("button", { name: /read & acknowledge/i }),
      ).toBeInTheDocument();
    });

    it("shows 'View Policy' for acknowledged", () => {
      renderWithProviders(<PolicyLibrary userRole="EMPLOYEE" />);
      expect(screen.getByRole("button", { name: /view policy/i })).toBeInTheDocument();
    });
  });

  describe("FE-DOC-002: Policy Acknowledgement Modal", () => {
    const mockPolicy = {
      id: "pol-1",
      title: "Code of Conduct v2.0",
      content: "# Code of Conduct\n\nAll employees must adhere to...",
      category: "HR" as const,
      status: "PUBLISHED" as const,
      createdBy: "admin",
      publishedBy: "admin",
      publishedAt: "2025-01-01T00:00:00Z",
      version: 2,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      acknowledgedByMe: false,
      acknowledgementCount: 45,
      totalEmployees: 100,
    };

    it("shows checkbox gate—confirm disabled until checked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <AcknowledgeModal policy={mockPolicy} onClose={vi.fn()} />,
      );

      const confirmBtn = screen.getByRole("button", {
        name: /confirm acknowledgement/i,
      });
      expect(confirmBtn).toBeDisabled();

      await user.click(
        screen.getByRole("checkbox", {
          name: /i have read and understood/i,
        }),
      );

      expect(confirmBtn).not.toBeDisabled();
    });

    it("read-only mode hides checkbox and confirm button", () => {
      renderWithProviders(
        <AcknowledgeModal policy={mockPolicy} readOnly onClose={vi.fn()} />,
      );

      expect(
        screen.queryByRole("checkbox", { name: /i have read/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /confirm acknowledgement/i }),
      ).not.toBeInTheDocument();
      const closeButtons = screen.getAllByRole("button", { name: "Close" });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("renders policy content", () => {
      renderWithProviders(
        <AcknowledgeModal policy={mockPolicy} onClose={vi.fn()} />,
      );

      expect(screen.getByText(/All employees must adhere to/)).toBeInTheDocument();
    });

    it("renders policy title in modal", () => {
      renderWithProviders(
        <AcknowledgeModal policy={mockPolicy} onClose={vi.fn()} />,
      );

      expect(screen.getByText("Code of Conduct v2.0")).toBeInTheDocument();
    });
  });

  describe("Policy Status Badge", () => {
    it("renders all three statuses correctly", () => {
      const { rerender } = render(<PolicyStatusBadge status="DRAFT" />);
      expect(screen.getByText("Draft")).toBeInTheDocument();

      rerender(<PolicyStatusBadge status="PUBLISHED" />);
      expect(screen.getByText("Published")).toBeInTheDocument();

      rerender(<PolicyStatusBadge status="ARCHIVED" />);
      expect(screen.getByText("Archived")).toBeInTheDocument();
    });
  });
});
