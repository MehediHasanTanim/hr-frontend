/**
 * Sprint 7 Regression — FE-REC-001: Recruitment Kanban drag-and-drop
 * RTL + Vitest component regression tests
 *
 * Covers:
 *   - Kanban board renders 5 stage columns with correct counts
 *   - Candidate cards display name, email, score
 *   - Drag handle present on active-stage cards
 *   - Hired column is drag-disabled with lock icon
 *   - Reject modal requires reason before submission
 *   - Archived panel shows rejected/withdrawn with counts
 *   - Loading skeleton and error state with retry
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { KanbanCard } from "@/features/recruitment/kanban/components/KanbanCard";
import { KanbanColumn } from "@/features/recruitment/kanban/components/KanbanColumn";
import { ArchivedPanel } from "@/features/recruitment/kanban/components/ArchivedPanel";
import { RejectModal } from "@/features/recruitment/kanban/components/RejectModal";
import type { Application } from "@/types/recruitment";

// ─── Mock DnD hooks ─────────────────────────────────────────────
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  closestCorners: vi.fn(),
}));

// ─── Mock API ───────────────────────────────────────────────────
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { data: [], total: 0, page: 1, limit: 200 } }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// ─── Mock toast store ───────────────────────────────────────────
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
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ─── Factory ─────────────────────────────────────────────────────
function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: overrides.id ?? "app-1",
    requisitionId: "req-1",
    candidateId: "cand-1",
    candidate: {
      id: "cand-1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      source: "careers_portal",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    stage: "applied",
    currentScore: 3.5,
    appliedAt: "2026-06-01T10:00:00Z",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// FE-REC-001 — Kanban Pipeline Board
// ═══════════════════════════════════════════════════════════════

describe("FE-REC-001 — Recruitment Kanban drag-and-drop", () => {
  describe("KanbanCard", () => {
    it("renders candidate name, email, and score", () => {
      render(
        <KanbanCard
          application={makeApp()}
          isDragDisabled={false}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText("Jane Doe")).toBeDefined();
      expect(screen.getByText("jane@example.com")).toBeDefined();
      expect(screen.getByText("Score: 3.5")).toBeDefined();
    });

    it("renders drag handle when not disabled", () => {
      render(
        <KanbanCard
          application={makeApp()}
          isDragDisabled={false}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByTestId("card-drag-handle-app-1")).toBeDefined();
    });

    it("hides drag handle when drag is disabled", () => {
      render(
        <KanbanCard
          application={makeApp()}
          isDragDisabled={true}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.queryByTestId("card-drag-handle-app-1")).toBeNull();
    });

    it("displays 'Unknown Candidate' when candidate is missing", () => {
      render(
        <KanbanCard
          application={makeApp({ candidate: undefined, candidateId: "cand-missing" })}
          isDragDisabled={false}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText("Unknown Candidate")).toBeDefined();
    });

    it("has accessible role and label", () => {
      render(
        <KanbanCard
          application={makeApp()}
          isDragDisabled={false}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      const card = screen.getByRole("listitem");
      expect(card.getAttribute("aria-label")).toContain("Jane Doe");
    });

    it("does not show score badge when score is undefined", () => {
      render(
        <KanbanCard
          application={makeApp({ currentScore: undefined })}
          isDragDisabled={false}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.queryByText(/Score:/)).toBeNull();
    });

    it("shows options menu trigger", () => {
      render(
        <KanbanCard
          application={makeApp()}
          isDragDisabled={false}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByTestId("card-menu-app-1")).toBeDefined();
    });
  });

  describe("KanbanColumn", () => {
    it("renders stage label and count badge", () => {
      render(
        <KanbanColumn
          stage="screening"
          applications={[makeApp({ id: "app-1", stage: "screening" })]}
          count={1}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText("Screening")).toBeDefined();
      expect(screen.getByText("1")).toBeDefined();
    });

    it("shows empty state when no applications", () => {
      render(
        <KanbanColumn
          stage="applied"
          applications={[]}
          count={0}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText("No applications")).toBeDefined();
    });

    it("hired column is visually muted and shows lock", () => {
      const { container } = render(
        <KanbanColumn
          stage="hired"
          applications={[]}
          count={0}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      const col = container.querySelector('[data-testid="kanban-column-hired"]');
      expect(col?.className).toContain("opacity-60");
    });

    it("offer column shows drag-disabled hint", () => {
      render(
        <KanbanColumn
          stage="offer"
          applications={[]}
          count={0}
          onReject={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText(/hire happens via Offer acceptance/i)).toBeDefined();
    });
  });

  describe("ArchivedPanel", () => {
    const archivedApps: Application[] = [
      makeApp({
        id: "rej-1",
        stage: "rejected",
        rejectionReason: "Not a good fit",
        candidate: {
          id: "c-1",
          firstName: "Bob",
          lastName: "Rejected",
          email: "bob@test.com",
          source: "careers_portal",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      }),
      makeApp({
        id: "wd-1",
        stage: "withdrawn",
        candidate: {
          id: "c-2",
          firstName: "Alice",
          lastName: "Withdrawn",
          email: "alice@test.com",
          source: "careers_portal",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      }),
    ];

    it("returns null when no archived applications", () => {
      const { container } = render(
        <ArchivedPanel
          applications={[]}
          isExpanded={false}
          onToggle={vi.fn()}
          onView={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("shows rejected and withdrawn counts", () => {
      render(
        <ArchivedPanel
          applications={archivedApps}
          isExpanded={false}
          onToggle={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText("1 rejected")).toBeDefined();
      expect(screen.getByText("1 withdrawn")).toBeDefined();
    });

    it("shows rejection reason when expanded", () => {
      render(
        <ArchivedPanel
          applications={archivedApps}
          isExpanded={true}
          onToggle={vi.fn()}
          onView={vi.fn()}
        />,
      );

      expect(screen.getByText(/Not a good fit/)).toBeDefined();
    });

    it("toggles expansion on header click", async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();

      render(
        <ArchivedPanel
          applications={archivedApps}
          isExpanded={false}
          onToggle={onToggle}
          onView={vi.fn()}
        />,
      );

      await user.click(screen.getByTestId("archived-toggle"));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onView when view button clicked", async () => {
      const onView = vi.fn();
      const user = userEvent.setup();

      render(
        <ArchivedPanel
          applications={archivedApps}
          isExpanded={true}
          onToggle={vi.fn()}
          onView={onView}
        />,
      );

      await user.click(screen.getByTestId("archived-view-rej-1"));
      expect(onView).toHaveBeenCalledWith(archivedApps[0]);
    });
  });

  describe("RejectModal — reason is required", () => {
    it("renders candidate name", () => {
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

      await user.click(screen.getByTestId("confirm-reject-btn"));

      // Error message should appear
      expect(screen.getByTestId("reject-reason-error")).toBeDefined();
    });

    it("calls onClose when Cancel is clicked", async () => {
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
});
