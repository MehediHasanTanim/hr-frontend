// src/features/recruitment/kanban/__tests__/KanbanCard.test.tsx
// Sprint 7 F1 — KanbanCard unit tests

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanCard } from "../components/KanbanCard";
import type { Application } from "@/types/recruitment";

// @dnd-kit/sortable requires DndContext in ancestor — mock useSortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

const mockApp: Application = {
  id: "app-1",
  requisitionId: "req-1",
  candidateId: "cand-1",
  candidate: {
    id: "cand-1",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    source: "careers_portal",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  stage: "screening",
  currentScore: 3.5,
  appliedAt: "2026-06-01T10:00:00Z",
  createdAt: "2026-06-01T10:00:00Z",
  updatedAt: "2026-06-01T10:00:00Z",
};

describe("KanbanCard", () => {
  it("renders candidate name and email", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeDefined();
    expect(screen.getByText("jane@example.com")).toBeDefined();
  });

  it("renders score badge when present", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Score: 3.5")).toBeDefined();
  });

  it("does not render score badge when score is undefined", () => {
    const appWithoutScore: Application = {
      ...mockApp,
      currentScore: undefined,
      candidate: {
        id: "cand-1",
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        source: "careers_portal",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    };

    render(
      <KanbanCard
        application={appWithoutScore}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Score:/)).toBeNull();
  });

  it("renders applied date", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText(/Applied:/)).toBeDefined();
  });

  it("renders drag handle when not disabled", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByTestId("card-drag-handle-app-1")).toBeDefined();
  });

  it("does not render drag handle when drag is disabled", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={true}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("card-drag-handle-app-1")).toBeNull();
  });

  it("renders options menu trigger", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByTestId("card-menu-app-1")).toBeDefined();
  });

  it("has accessible label with candidate name and stage", () => {
    render(
      <KanbanCard
        application={mockApp}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    const card = screen.getByRole("listitem");
    expect(card.getAttribute("aria-label")).toContain("Jane Doe");
    expect(card.getAttribute("aria-label")).toContain("Screening");
  });

  it("handles missing candidate gracefully", () => {
    const appNoCandidate: Application = {
      ...mockApp,
      candidate: undefined,
      candidateId: "cand-missing",
    };

    render(
      <KanbanCard
        application={appNoCandidate}
        isDragDisabled={false}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Unknown Candidate")).toBeDefined();
  });
});
