// src/features/performance/__tests__/performance.regression.test.tsx
// Sprint 8 Regression — OKR Tree, Review, PIP components

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalProgressBar } from "../components/GoalProgressBar";
import { OkrTreeView } from "../components/OkrTreeView";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import type { Goal } from "@/types/performance";

// Mock OKR API
vi.mock("@/features/performance/api/okr", () => ({
  useGoalCheckIns: () => ({ data: [], isLoading: false }),
  usePostCheckIn: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe("FE-REC-009 — OKR Tree & Performance Management", () => {
  describe("GoalProgressBar", () => {
    it("renders progress for numeric target", () => {
      render(<GoalProgressBar currentValue={50} targetValue={100} unit="%" />);

      expect(screen.getByText("50 / 100 %")).toBeDefined();
      expect(screen.getByRole("progressbar")).toBeDefined();
    });

    it('shows "Qualitative" when targetValue is null', () => {
      render(<GoalProgressBar currentValue={null} targetValue={null} unit={null} />);

      expect(screen.getByText("Qualitative")).toBeDefined();
    });

    it("caps at 100% when current exceeds target", () => {
      render(<GoalProgressBar currentValue={120} targetValue={100} unit="%" />);

      expect(screen.getByText(">100%")).toBeDefined();
    });

    it("handles zero current value", () => {
      render(<GoalProgressBar currentValue={0} targetValue={100} unit="%" />);

      expect(screen.getByText("0 / 100 %")).toBeDefined();
    });
  });

  describe("OkrTreeView", () => {
    const mockTree: Goal[] = [
      {
        id: "g1",
        employeeId: "e1",
        parentGoalId: null,
        cycleId: "c1",
        title: "Company Objective",
        description: "Top-level goal",
        goalType: "objective",
        targetValue: null,
        currentValue: null,
        unit: null,
        weight: null,
        status: "on_track",
        dueDate: null,
        children: [
          {
            id: "g2",
            employeeId: "e1",
            parentGoalId: "g1",
            cycleId: "c1",
            title: "Key Result 1",
            description: null,
            goalType: "key_result",
            targetValue: 100,
            currentValue: 45,
            unit: "%",
            weight: 50,
            status: "on_track",
            dueDate: null,
            children: [],
          },
        ],
      },
    ];

    it("renders goal nodes with title and status", () => {
      render(<OkrTreeView goals={mockTree} isLoading={false} />);

      expect(screen.getByText("Company Objective")).toBeDefined();
      expect(screen.getByText("Key Result 1")).toBeDefined();
      // "on track" appears on multiple goal nodes — verify at least one exists
      const statusBadges = screen.getAllByText("on track");
      expect(statusBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("renders progress bar for key results with numeric target", () => {
      render(<OkrTreeView goals={mockTree} isLoading={false} />);

      expect(screen.getByText("45 / 100 %")).toBeDefined();
    });

    it("renders empty state when no goals", () => {
      render(<OkrTreeView goals={[]} isLoading={false} />);

      expect(screen.getByTestId("okr-tree-empty")).toBeDefined();
      expect(screen.getByText(/No goals yet/i)).toBeDefined();
    });

    it("renders loading skeletons", () => {
      render(<OkrTreeView goals={[]} isLoading={true} />);

      expect(screen.getByTestId("okr-tree-loading")).toBeDefined();
    });

    it("collapse/expand toggles child visibility", async () => {
      const user = userEvent.setup();
      render(<OkrTreeView goals={mockTree} isLoading={false} />);

      // Child should be visible initially
      expect(screen.getByText("Key Result 1")).toBeDefined();

      // Click expand/collapse toggle
      await user.click(screen.getByTestId("goal-expand-g1"));

      // Child should be hidden after collapse
      expect(screen.queryByText("Key Result 1")).toBeNull();
    });
  });

  describe("ConfirmActionModal", () => {
    it("renders title and description", () => {
      render(
        <ConfirmActionModal
          open={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Confirm Action"
          description="Are you sure?"
        />,
      );

      expect(screen.getByText("Confirm Action")).toBeDefined();
      expect(screen.getByText("Are you sure?")).toBeDefined();
    });

    it("shows justification field when required", () => {
      render(
        <ConfirmActionModal
          open={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Apply Override"
          description="Enter justification"
          requireJustification={true}
          justificationLabel="Override reason"
        />,
      );

      expect(screen.getByTestId("confirm-justification")).toBeDefined();
    });

    it("blocks submit when justification is required and empty", async () => {
      const onConfirm = vi.fn();
      const user = userEvent.setup();

      render(
        <ConfirmActionModal
          open={true}
          onClose={vi.fn()}
          onConfirm={onConfirm}
          title="Test"
          description="Test"
          requireJustification={true}
        />,
      );

      await user.click(screen.getByTestId("confirm-action-btn"));

      expect(screen.getByTestId("confirm-justification-error")).toBeDefined();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
