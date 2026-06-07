import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SalaryRevisionDrawer } from "@/features/payroll/components/SalaryRevisionDrawer";

// ─── Mocks ───────────────────────────────────────────────────────
const mockStructures = [
  {
    id: "struct-11111111-1111-1111-1111-111111111111",
    name: "Standard Full-Time",
    description: null,
    isActive: true,
    components: [
      {
        id: "sc-1",
        componentId: "comp-basic",
        sortOrder: 1,
        defaultValue: 25000,
        component: {
          id: "comp-basic",
          companyId: "c1",
          name: "Basic Pay",
          code: "BASIC",
          type: "earning" as const,
          calculationType: "fixed" as const,
          formula: null,
          isActive: true,
        },
      },
    ],
  },
  {
    id: "struct-22222222-2222-2222-2222-222222222222",
    name: "Part-Time",
    description: null,
    isActive: true,
    components: [],
  },
];

const mockMutate = vi.fn();

vi.mock("@/features/payroll/api/salary-structures", () => ({
  useSalaryStructures: () => ({
    data: mockStructures,
    isLoading: false,
  }),
}));

vi.mock("@/features/payroll/api/employee-salary", () => ({
  useAssignEmployeeSalary: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

function renderDrawer(open = true, employeeId = "emp-1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onClose = vi.fn();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <SalaryRevisionDrawer
        open={open}
        onClose={onClose}
        employeeId={employeeId}
      />
    </QueryClientProvider>,
  );
  return { onClose, ...result };
}

describe("SalaryRevisionDrawer — CTC input validation", () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it("shows error when structure not selected and submit clicked", async () => {
    const user = userEvent.setup();
    renderDrawer();

    // Find inputs by their placeholder/default values
    const ctcInput = screen.getByDisplayValue("0");
    fireEvent.change(ctcInput, { target: { value: "600000" } });

    // The effective date input has today's date as default
    const today = new Date().toISOString().slice(0, 10);
    const effDateInput = screen.getByDisplayValue(today);
    await user.clear(effDateInput);
    await user.type(effDateInput, "2024-07-01");

    await user.click(screen.getByRole("button", { name: /assign salary/i }));

    expect(
      screen.getByText(/select a salary structure/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows monthly CTC preview below the input", () => {
    renderDrawer();

    const ctcInput = screen.getByDisplayValue("0");
    fireEvent.change(ctcInput, { target: { value: "600000" } });

    expect(screen.getByText(/monthly.*50,000/i)).toBeInTheDocument();
  });

  it("shows divisibility warning when CTC is not divisible by 12", () => {
    renderDrawer();

    const ctcInput = screen.getByDisplayValue("0");
    fireEvent.change(ctcInput, { target: { value: "600001" } });

    expect(screen.getByText(/consider adjusting/i)).toBeInTheDocument();
  });
});
