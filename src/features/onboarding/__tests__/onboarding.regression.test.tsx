// src/features/onboarding/__tests__/onboarding.regression.test.tsx
// Sprint 8 Regression — Onboarding Task Checklist (F1)

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskCard } from "../components/TaskCard";
import { OnboardingProgressHeader } from "../components/OnboardingProgressHeader";
import { TaskChecklist } from "../components/TaskChecklist";
import { OverdueBadge } from "@/components/ui/OverdueBadge";
import type { OnboardingTaskInstance } from "@/types/onboarding";

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

function makeTask(overrides: Partial<OnboardingTaskInstance> = {}): OnboardingTaskInstance {
  return {
    id: "task-1",
    employeeOnboardingId: "onb-1",
    title: "Complete tax forms",
    description: "Fill out W-4 and state tax forms",
    category: "paperwork",
    assigneeRole: "employee",
    dueDate: "2026-08-15",
    status: "pending",
    completedBy: null,
    completedAt: null,
    ...overrides,
  };
}

describe("FE-REC-008 — Onboarding Task Checklist", () => {
  describe("TaskCard", () => {
    it("renders title, category badge, and due date", () => {
      render(
        <TaskCard
          task={makeTask()}
          viewerRole="employee"
          isDisabled={false}
          isReadOnly={false}
          onComplete={vi.fn()}
        />,
      );

      expect(screen.getByText("Complete tax forms")).toBeDefined();
      expect(screen.getByText("paperwork")).toBeDefined();
      expect(screen.getByText(/Assigned to/)).toBeDefined();
    });

    it("enables complete button when viewer role matches assignee", () => {
      render(
        <TaskCard
          task={makeTask({ assigneeRole: "employee" })}
          viewerRole="employee"
          isDisabled={false}
          isReadOnly={false}
          onComplete={vi.fn()}
        />,
      );

      const btn = screen.getByTestId("complete-task-task-1");
      expect(btn.hasAttribute("disabled")).toBe(false);
    });

    it("disables complete button when viewer role does not match assignee", () => {
      render(
        <TaskCard
          task={makeTask({ assigneeRole: "it" })}
          viewerRole="employee"
          isDisabled={false}
          isReadOnly={false}
          onComplete={vi.fn()}
        />,
      );

      const btn = screen.getByTestId("complete-task-task-1");
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    it("shows check icon when task is completed", () => {
      render(
        <TaskCard
          task={makeTask({ status: "completed", completedAt: "2026-08-01T10:00:00Z" })}
          viewerRole="employee"
          isDisabled={false}
          isReadOnly={false}
          onComplete={vi.fn()}
        />,
      );

      // Should show the CheckCircle2 icon (green check)
      const btn = screen.getByTestId("complete-task-task-1");
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    it("disables when read-only (completed onboarding)", () => {
      render(
        <TaskCard
          task={makeTask()}
          viewerRole="employee"
          isDisabled={false}
          isReadOnly={true}
          onComplete={vi.fn()}
        />,
      );

      const btn = screen.getByTestId("complete-task-task-1");
      expect(btn.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("OnboardingProgressHeader", () => {
    it("renders completion percentage and hire date", () => {
      render(
        <OnboardingProgressHeader
          completionPercentage={75}
          hireDate="2026-07-01"
          status="in_progress"
          isLoading={false}
        />,
      );

      expect(screen.getByText("75%")).toBeDefined();
      expect(screen.getByText("In Progress")).toBeDefined();
    });

    it("renders completed status with success text", () => {
      render(
        <OnboardingProgressHeader
          completionPercentage={100}
          hireDate="2026-07-01"
          status="completed"
          isLoading={false}
        />,
      );

      expect(screen.getByText(/All tasks completed/i)).toBeDefined();
    });

    it("renders skeleton while loading", () => {
      render(
        <OnboardingProgressHeader
          completionPercentage={0}
          hireDate=""
          status="in_progress"
          isLoading={true}
        />,
      );

      expect(screen.getByTestId("onboarding-header-loading")).toBeDefined();
    });

    it("renders cancelled status", () => {
      render(
        <OnboardingProgressHeader
          completionPercentage={0}
          hireDate="2026-07-01"
          status="cancelled"
          isLoading={false}
        />,
      );

      expect(screen.getByText("Cancelled")).toBeDefined();
    });

    it("progress bar has aria attributes", () => {
      render(
        <OnboardingProgressHeader
          completionPercentage={75}
          hireDate="2026-07-01"
          status="in_progress"
          isLoading={false}
        />,
      );

      const bar = screen.getByRole("progressbar");
      expect(bar.getAttribute("aria-valuenow")).toBe("75");
      expect(bar.getAttribute("aria-valuemax")).toBe("100");
    });
  });

  describe("TaskChecklist", () => {
    const tasks = [
      makeTask({ id: "t1", assigneeRole: "employee", title: "Task 1" }),
      makeTask({ id: "t2", assigneeRole: "manager", title: "Task 2" }),
      makeTask({ id: "t3", assigneeRole: "it", title: "Task 3" }),
    ];

    it("renders all tasks by default", () => {
      renderWithProviders(
        <TaskChecklist
          tasks={tasks}
          viewerRole="employee"
          isReadOnly={false}
          isLoading={false}
          onComplete={vi.fn()}
        />,
      );

      expect(screen.getByText("Task 1")).toBeDefined();
      expect(screen.getByText("Task 2")).toBeDefined();
      expect(screen.getByText("Task 3")).toBeDefined();
    });

    it("filters by assignee role when tab is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskChecklist
          tasks={tasks}
          viewerRole="employee"
          isReadOnly={false}
          isLoading={false}
          onComplete={vi.fn()}
        />,
      );

      await user.click(screen.getByTestId("filter-it"));

      // Only IT task should be visible
      expect(screen.queryByText("Task 1")).toBeNull();
      expect(screen.queryByText("Task 2")).toBeNull();
      expect(screen.getByText("Task 3")).toBeDefined();
    });

    it("renders loading skeletons", () => {
      renderWithProviders(
        <TaskChecklist
          tasks={[]}
          viewerRole="employee"
          isReadOnly={false}
          isLoading={true}
          onComplete={vi.fn()}
        />,
      );

      expect(screen.getByTestId("task-checklist-loading")).toBeDefined();
    });
  });

  describe("OverdueBadge (shared component)", () => {
    it("renders nothing when task is completed", () => {
      const { container } = render(
        <OverdueBadge dueDate="2020-01-01" isCompleted={true} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing when due date is in the future", () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const { container } = render(
        <OverdueBadge dueDate={future.toISOString()} isCompleted={false} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders overdue badge when past due and not completed", () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      render(<OverdueBadge dueDate={past.toISOString()} isCompleted={false} />);

      expect(screen.getByTestId("overdue-badge")).toBeDefined();
    });
  });
});
