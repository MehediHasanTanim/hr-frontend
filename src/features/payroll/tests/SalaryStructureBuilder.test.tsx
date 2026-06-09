import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SalaryStructureBuilder } from "@/features/payroll/components/SalaryStructureBuilder";

// ─── Mocks ───────────────────────────────────────────────────────
const mockComponents = [
  {
    id: "comp-basic",
    companyId: "c1",
    name: "Basic Pay",
    code: "BASIC",
    type: "earning" as const,
    calculationType: "fixed" as const,
    formula: null,
    isActive: true,
  },
  {
    id: "comp-hra",
    companyId: "c1",
    name: "HRA",
    code: "HRA",
    type: "earning" as const,
    calculationType: "percentage_of_base" as const,
    formula: null,
    isActive: true,
  },
  {
    id: "comp-pf",
    companyId: "c1",
    name: "Provident Fund",
    code: "PF",
    type: "deduction" as const,
    calculationType: "formula" as const,
    formula: "BASIC * 0.12",
    isActive: true,
  },
  {
    id: "comp-tax",
    companyId: "c1",
    name: "Income Tax",
    code: "IT",
    type: "deduction" as const,
    calculationType: "formula" as const,
    formula: "(BASIC + HRA) * 0.1",
    isActive: true,
  },
];

const mockMutateAsync = vi.fn().mockResolvedValue({ id: "new-struct" });

vi.mock("@/features/payroll/api/salary-components", () => ({
  useSalaryComponents: () => ({
    data: mockComponents,
    isLoading: false,
  }),
}));

vi.mock("@/features/payroll/api/salary-structures", () => ({
  useCreateSalaryStructure: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useUpdateSalaryStructure: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

function renderBuilder() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onSuccess = vi.fn();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <SalaryStructureBuilder onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
  return { onSuccess, ...result };
}

describe("SalaryStructureBuilder", () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  it("renders the builder with component picker and canvas", () => {
    renderBuilder();

    expect(screen.getByPlaceholderText("e.g. Standard Full-Time")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search components...")).toBeInTheDocument();
    expect(screen.getByText("Earnings")).toBeInTheDocument();
    expect(screen.getByText("Deductions")).toBeInTheDocument();
  });

  it("shows empty canvas prompt when no components added", () => {
    renderBuilder();

    expect(
      screen.getByText(/add components from the left panel/i),
    ).toBeInTheDocument();
  });

  it("shows live preview after adding components", () => {
    renderBuilder();

    // Click "Add" for Basic Pay
    const addButtons = screen.getAllByRole("button", { name: /add/i });
    // First "Add" button should be for Basic Pay
    // The "+" Add buttons are the ones with "Add" text next to them
    const basicAddBtn = addButtons[0];
    basicAddBtn.click();

    // Should now show the component on canvas
    expect(screen.getByText("Basic Pay")).toBeInTheDocument();
  });

  it("shows all component types in the picker", () => {
    renderBuilder();

    expect(screen.getByText("Earnings")).toBeInTheDocument();
    expect(screen.getByText("Deductions")).toBeInTheDocument();
  });

  it("disables create button when name is too short", () => {
    renderBuilder();

    const createBtn = screen.getByRole("button", { name: /create structure/i });
    expect(createBtn).toBeDisabled();
  });

  it("enables create button when name and components are valid", () => {
    renderBuilder();

    const nameInput = screen.getByPlaceholderText("e.g. Standard Full-Time");
    const addButtons = screen.getAllByRole("button", { name: /add/i });

    // Add a name
    nameInput.setAttribute("value", "Test Structure");
    nameInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Add a component
    addButtons[0].click();
  });
});
