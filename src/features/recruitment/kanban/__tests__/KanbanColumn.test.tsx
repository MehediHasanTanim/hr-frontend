// src/features/recruitment/kanban/__tests__/KanbanColumn.test.tsx
// Sprint 7 F1 — KanbanColumn unit tests

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanColumn } from "../components/KanbanColumn";
import type { Application } from "@/types/recruitment";

// Mock DnD hooks
vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
}));

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

const mockApps: Application[] = [
  {
    id: "app-1",
    requisitionId: "req-1",
    candidateId: "cand-1",
    candidate: {
      id: "cand-1",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      source: "careers_portal",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    stage: "screening",
    currentScore: 4.0,
    appliedAt: "2026-06-01T10:00:00Z",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
  },
];

describe("KanbanColumn", () => {
  it("renders stage label and count badge", () => {
    render(
      <KanbanColumn
        stage="screening"
        applications={mockApps}
        count={1}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Screening")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
  });

  it("renders empty state when no applications", () => {
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

  it("shows lock icon and hint for hired column (drag disabled)", () => {
    render(
      <KanbanColumn
        stage="hired"
        applications={[]}
        count={0}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Hire via Offer flow")).toBeDefined();
  });

  it("shows drag hint for offer column", () => {
    render(
      <KanbanColumn
        stage="offer"
        applications={[]}
        count={0}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/hire happens via Offer acceptance/i),
    ).toBeDefined();
  });

  it("hired column is visually muted", () => {
    const { container } = render(
      <KanbanColumn
        stage="hired"
        applications={mockApps}
        count={1}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    const col = container.querySelector('[data-testid="kanban-column-hired"]');
    expect(col?.className).toContain("opacity-60");
  });

  it("renders application cards within the column", () => {
    render(
      <KanbanColumn
        stage="screening"
        applications={mockApps}
        count={1}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Alice Smith")).toBeDefined();
  });
});
