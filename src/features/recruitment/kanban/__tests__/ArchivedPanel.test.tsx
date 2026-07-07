// src/features/recruitment/kanban/__tests__/ArchivedPanel.test.tsx
// Sprint 7 F1 — ArchivedPanel unit tests

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArchivedPanel } from "../components/ArchivedPanel";
import type { Application } from "@/types/recruitment";

const mockArchived: Application[] = [
  {
    id: "app-1",
    requisitionId: "req-1",
    candidateId: "cand-1",
    candidate: {
      id: "cand-1",
      firstName: "Bob",
      lastName: "Rejected",
      email: "bob@example.com",
      source: "careers_portal",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    stage: "rejected",
    rejectionReason: "Not a good fit",
    appliedAt: "2026-06-01T10:00:00Z",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "app-2",
    requisitionId: "req-1",
    candidateId: "cand-2",
    candidate: {
      id: "cand-2",
      firstName: "Alice",
      lastName: "Withdrawn",
      email: "alice@example.com",
      source: "careers_portal",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    stage: "withdrawn",
    appliedAt: "2026-06-02T10:00:00Z",
    createdAt: "2026-06-02T10:00:00Z",
    updatedAt: "2026-06-02T10:00:00Z",
  },
];

describe("ArchivedPanel", () => {
  it("returns null when applications array is empty", () => {
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

  it("shows rejected and withdrawn counts in header", () => {
    render(
      <ArchivedPanel
        applications={mockArchived}
        isExpanded={false}
        onToggle={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Archived")).toBeDefined();
    expect(screen.getByText("1 rejected")).toBeDefined();
    expect(screen.getByText("1 withdrawn")).toBeDefined();
  });

  it("is collapsed by default — does not show card list", () => {
    render(
      <ArchivedPanel
        applications={mockArchived}
        isExpanded={false}
        onToggle={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.queryByText("Bob Rejected")).toBeNull();
  });

  it("shows cards when expanded", () => {
    render(
      <ArchivedPanel
        applications={mockArchived}
        isExpanded={true}
        onToggle={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Bob Rejected")).toBeDefined();
    expect(screen.getByText("Alice Withdrawn")).toBeDefined();
  });

  it("shows rejection reason for rejected applications", () => {
    render(
      <ArchivedPanel
        applications={mockArchived}
        isExpanded={true}
        onToggle={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText(/Not a good fit/)).toBeDefined();
  });

  it("calls onToggle when header is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <ArchivedPanel
        applications={mockArchived}
        isExpanded={false}
        onToggle={onToggle}
        onView={vi.fn()}
      />,
    );

    await user.click(screen.getByTestId("archived-toggle"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onView when view button is clicked", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();

    render(
      <ArchivedPanel
        applications={mockArchived}
        isExpanded={true}
        onToggle={vi.fn()}
        onView={onView}
      />,
    );

    await user.click(screen.getByTestId("archived-view-app-1"));
    expect(onView).toHaveBeenCalledWith(mockArchived[0]);
  });
});
