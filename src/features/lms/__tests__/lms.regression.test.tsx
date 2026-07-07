// src/features/lms/__tests__/lms.regression.test.tsx
// Sprint 9 Regression — LMS Course Catalog, Learning Paths, My Training

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CourseCard } from "../courses/components/CourseCard";
import { CourseFilterBar } from "../courses/components/CourseFilterBar";
import { LearningPathViewer } from "../learning-paths/components/LearningPathViewer";
import { OverdueAlertBanner } from "../my-training/components/OverdueAlertBanner";
import { CertExpiryCountdown } from "../my-training/components/CertExpiryCountdown";
import { ProgressBar } from "../my-training/components/ProgressBar";
import type { Course, LearningPathStep, MyTrainingItem, MyCertification } from "@/types/lms";

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const mockCourse: Course = {
  id: "c1",
  title: "Introduction to TypeScript",
  description: "Learn TypeScript fundamentals",
  thumbnailUrl: null,
  format: "self_paced",
  externalUrl: null,
  durationMinutes: 120,
  status: "published",
  isMandatory: false,
  skillTags: [{ id: "s1", name: "TypeScript" }, { id: "s2", name: "Frontend" }],
};

// ═══════════════════════════════════════════════════════════════
// FE-LMS-001 — Course Catalog
// ═══════════════════════════════════════════════════════════════

describe("FE-LMS-001 — Course Catalog", () => {
  describe("CourseCard", () => {
    it("renders title, format, and duration", () => {
      render(<CourseCard course={mockCourse} onEnroll={vi.fn()} />);

      expect(screen.getByText("Introduction to TypeScript")).toBeDefined();
      expect(screen.getByText("Self-paced")).toBeDefined();
      expect(screen.getByText("120 min")).toBeDefined();
    });

    it("renders Mandatory badge when isMandatory is true", () => {
      render(
        <CourseCard course={{ ...mockCourse, isMandatory: true }} onEnroll={vi.fn()} />,
      );

      expect(screen.getByText("Mandatory")).toBeDefined();
      expect(screen.getByTestId("mandatory-c1")).toBeDefined();
    });

    it("does not render Mandatory badge for optional courses", () => {
      render(<CourseCard course={mockCourse} onEnroll={vi.fn()} />);

      expect(screen.queryByTestId("mandatory-c1")).toBeNull();
    });

    it("renders skill tags", () => {
      render(<CourseCard course={mockCourse} onEnroll={vi.fn()} />);

      expect(screen.getByText("TypeScript")).toBeDefined();
      expect(screen.getByText("Frontend")).toBeDefined();
    });

    it("calls onEnroll when Enroll button clicked", async () => {
      const onEnroll = vi.fn();
      const user = userEvent.setup();

      render(<CourseCard course={mockCourse} onEnroll={onEnroll} />);

      await user.click(screen.getByTestId("enroll-btn-c1"));
      expect(onEnroll).toHaveBeenCalledWith("c1");
    });
  });

  describe("CourseFilterBar", () => {
    it("renders search, category, format, and mandatory toggle", () => {
      render(<CourseFilterBar filters={{ page: 1, limit: 12 }} onChange={vi.fn()} />);

      expect(screen.getByTestId("course-search")).toBeDefined();
      expect(screen.getByTestId("course-category-filter")).toBeDefined();
      expect(screen.getByTestId("course-format-filter")).toBeDefined();
      expect(screen.getByTestId("course-mandatory-filter")).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// FE-LMS-002 — Learning Path Viewer
// ═══════════════════════════════════════════════════════════════

describe("FE-LMS-002 — Learning Path Viewer", () => {
  const steps: LearningPathStep[] = [
    {
      courseId: "c1", courseTitle: "Intro Course", sequenceOrder: 1,
      isCompleted: true, isUnlocked: true, prerequisiteTitle: null,
    },
    {
      courseId: "c2", courseTitle: "Advanced Course", sequenceOrder: 2,
      isCompleted: false, isUnlocked: true, prerequisiteTitle: null,
    },
    {
      courseId: "c3", courseTitle: "Locked Course", sequenceOrder: 3,
      isCompleted: false, isUnlocked: false, prerequisiteTitle: "Advanced Course",
    },
  ];

  it("renders completed steps with checkmark", () => {
    render(<LearningPathViewer steps={steps} isLoading={false} />);

    expect(screen.getByText("Intro Course")).toBeDefined();
    expect(screen.getByText("Completed")).toBeDefined();
  });

  it("locked steps are not tab-focusable", () => {
    render(<LearningPathViewer steps={steps} isLoading={false} />);

    const locked = screen.getByTestId("locked-step-c3");
    expect(locked.getAttribute("tabindex")).toBe("-1");
    expect(locked.getAttribute("aria-disabled")).toBe("true");
  });

  it("unlocked steps are tab-focusable", () => {
    render(<LearningPathViewer steps={steps} isLoading={false} />);

    const unlocked = screen.getByTestId("unlocked-step-c2");
    expect(unlocked.getAttribute("tabindex")).toBe("0");
  });

  it("renders loading skeletons", () => {
    render(<LearningPathViewer steps={[]} isLoading={true} />);

    expect(screen.getByTestId("learning-path-loading")).toBeDefined();
  });

  it("renders empty state", () => {
    render(<LearningPathViewer steps={[]} isLoading={false} />);

    expect(screen.getByTestId("learning-path-empty")).toBeDefined();
    expect(screen.getByText(/No steps/i)).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// FE-LMS-003 — My Training
// ═══════════════════════════════════════════════════════════════

describe("FE-LMS-003 — My Training", () => {
  describe("OverdueAlertBanner", () => {
    it("returns null when no overdue items", () => {
      const { container } = render(<OverdueAlertBanner items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders overdue course titles with links", () => {
      const items: MyTrainingItem[] = [
        {
          enrollmentId: "e1", courseTitle: "Safety Training",
          isMandatory: true, deadlineAt: "2026-01-01", progressPercent: 20,
          status: "in_progress", isOverdue: true,
        },
        {
          enrollmentId: "e2", courseTitle: "Compliance 101",
          isMandatory: true, deadlineAt: "2026-02-01", progressPercent: 0,
          status: "not_started", isOverdue: true,
        },
      ];

      render(<OverdueAlertBanner items={items} />);

      expect(screen.getByTestId("overdue-banner")).toBeDefined();
      expect(screen.getByText("2 overdue courses")).toBeDefined();
      expect(screen.getByText("Safety Training")).toBeDefined();
      expect(screen.getByText("Compliance 101")).toBeDefined();
    });

    it('renders singular "1 overdue course"', () => {
      const items: MyTrainingItem[] = [{
        enrollmentId: "e1", courseTitle: "Safety",
        isMandatory: true, deadlineAt: "2026-01-01", progressPercent: 0,
        status: "not_started", isOverdue: true,
      }];

      render(<OverdueAlertBanner items={items} />);

      expect(screen.getByText("1 overdue course")).toBeDefined();
    });
  });

  describe("CertExpiryCountdown", () => {
    it("shows 'Expired' for negative days", () => {
      const cert: MyCertification = {
        id: "cert-1", certificationName: "AWS Certified",
        expiryDate: "2026-01-01", daysUntilExpiry: -30,
        verificationStatus: "verified",
      };

      render(<CertExpiryCountdown cert={cert} />);

      expect(screen.getByText("Expired 30 days ago")).toBeDefined();
    });

    it("shows red for under 7 days", () => {
      const cert: MyCertification = {
        id: "cert-1", certificationName: "AWS Certified",
        expiryDate: "2026-08-01", daysUntilExpiry: 5,
        verificationStatus: "verified",
      };

      render(<CertExpiryCountdown cert={cert} />);

      const text = screen.getByText("Expires in 5 days");
      expect(text.className).toContain("text-red-600");
    });

    it("shows amber for under 30 days", () => {
      const cert: MyCertification = {
        id: "cert-1", certificationName: "AWS Certified",
        expiryDate: "2026-08-01", daysUntilExpiry: 20,
        verificationStatus: "verified",
      };

      render(<CertExpiryCountdown cert={cert} />);

      const text = screen.getByText("Expires in 20 days");
      expect(text.className).toContain("text-amber-600");
    });

    it("shows 'Expires today' for zero days", () => {
      const cert: MyCertification = {
        id: "cert-1", certificationName: "AWS Certified",
        expiryDate: "2026-08-01", daysUntilExpiry: 0,
        verificationStatus: "verified",
      };

      render(<CertExpiryCountdown cert={cert} />);

      expect(screen.getByText("Expires today")).toBeDefined();
    });
  });

  describe("ProgressBar", () => {
    it("renders with correct aria attributes", () => {
      render(<ProgressBar value={45} />);

      const bar = screen.getByRole("progressbar");
      expect(bar.getAttribute("aria-valuenow")).toBe("45");
      expect(bar.getAttribute("aria-valuemax")).toBe("100");
    });

    it("clamps at 100%", () => {
      render(<ProgressBar value={150} />);

      const bar = screen.getByRole("progressbar");
      expect(bar.getAttribute("aria-valuenow")).toBe("100");
    });
  });
});
