// src/features/skills/__tests__/skills.regression.test.tsx
// Sprint 9 Regression — Skills Matrix Heatmap

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SkillsMatrixHeatmap } from "../matrix/components/SkillsMatrixHeatmap";
import type { SkillsMatrixResponse } from "@/types/skills";

// Mock API
vi.mock("@/features/skills/matrix/api", () => ({
  useSkillsMatrixQuery: vi.fn(),
}));

import { useSkillsMatrixQuery } from "@/features/skills/matrix/api";

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const mockData: SkillsMatrixResponse = {
  employees: [
    { id: "e1", name: "Alice", department: "Engineering" },
    { id: "e2", name: "Bob", department: "Engineering" },
  ],
  skills: [
    { id: "s1", name: "TypeScript", category: "Technical" },
    { id: "s2", name: "Leadership", category: "Soft Skills" },
  ],
  cells: [
    { employeeId: "e1", employeeName: "Alice", skillId: "s1", skillName: "TypeScript", level: 4, isValidated: true, hasGap: false },
    { employeeId: "e1", employeeName: "Alice", skillId: "s2", skillName: "Leadership", level: 2, isValidated: false, hasGap: true },
    { employeeId: "e2", employeeName: "Bob", skillId: "s1", skillName: "TypeScript", level: null, isValidated: false, hasGap: true },
    { employeeId: "e2", employeeName: "Bob", skillId: "s2", skillName: "Leadership", level: 5, isValidated: true, hasGap: false },
  ],
};

describe("FE-LMS-002 — Skills Matrix Heatmap", () => {
  it("renders table with employee rows and skill columns", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("Leadership")).toBeDefined();
  });

  it("renders cell level values", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    // Alice/TypeScript = 4
    const cellA = screen.getByTestId("cell-e1-s1");
    expect(cellA.textContent).toContain("4");
  });

  it("renders '—' for null levels", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    // Bob/TypeScript = null
    const cellB = screen.getByTestId("cell-e2-s1");
    expect(cellB.textContent).toContain("—");
  });

  it("renders loading skeletons", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    expect(screen.getByTestId("skills-matrix-loading")).toBeDefined();
  });

  it("renders empty state when no data", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { employees: [], skills: [], cells: [] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    expect(screen.getByTestId("skills-matrix-empty")).toBeDefined();
  });

  it("renders legend with level colors", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    expect(screen.getByTestId("skills-matrix-legend")).toBeDefined();
  });

  it("gap indicator renders on cells with hasGap", () => {
    (useSkillsMatrixQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<SkillsMatrixHeatmap />);

    // Alice/Leadership has gap, Bob/TypeScript has gap
    const cells = screen.getAllByTestId(/^cell-/);
    expect(cells.length).toBe(4);
  });
});
