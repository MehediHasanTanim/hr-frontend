import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LeaveRequestForm } from "@/features/leave/components/LeaveRequestForm";
import type { LeaveBalance, LeaveType } from "@/features/leave/types";

// ─── Mocks ───────────────────────────────────────────────────────
const mockLeaveTypes: LeaveType[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Annual Leave",
    code: "AL",
    accrualType: "monthly",
    accrualAmount: 2.5,
    maxCarryForward: 5,
    maxBalance: 30,
    isPaid: true,
    isActive: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Sick Leave",
    code: "SL",
    accrualType: "monthly",
    accrualAmount: 1.5,
    maxCarryForward: 0,
    maxBalance: 15,
    isPaid: true,
    isActive: true,
  },
];

const mockBalances: LeaveBalance[] = [
  {
    leaveTypeId: "550e8400-e29b-41d4-a716-446655440001",
    leaveTypeName: "Annual Leave",
    year: 2024,
    entitled: 30,
    used: 5,
    carriedForward: 0,
    closing: 25,
  },
  {
    leaveTypeId: "550e8400-e29b-41d4-a716-446655440002",
    leaveTypeName: "Sick Leave",
    year: 2024,
    entitled: 15,
    used: 2,
    carriedForward: 0,
    closing: 13,
  },
];

const mockMutate = vi.fn();
let mockBalanceData = mockBalances;

vi.mock("@/features/leave/api/leaveApi", () => ({
  useLeaveTypes: () => ({ data: mockLeaveTypes, isLoading: false }),
  useLeaveBalances: () => ({ data: mockBalanceData }),
  useCreateLeaveRequest: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
}));

// We need to override the date check in the schema to avoid "past dates" errors
// when testing with non-current dates. The schema uses startOfToday() internally.
// Instead, we'll use future dates relative to the test environment.

// ─── Helpers ─────────────────────────────────────────────────────
function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LeaveRequestForm />
    </QueryClientProvider>,
  );
}

async function selectLeaveType(user: ReturnType<typeof userEvent.setup>) {
  const select = screen.getByLabelText(/leave type/i);
  await user.selectOptions(select, mockLeaveTypes[0].id);
}

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("LeaveRequestForm — date validation", () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockBalanceData = mockBalances;
  });

  it("shows error when end date is before start date", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const end = futureDate(5);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(/end date must be on or after start date/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows error when start date is in the past", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const yesterday = futureDate(-1);
    const tomorrow = futureDate(1);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: yesterday },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: tomorrow },
    });
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(/start date cannot be in the past/i),
    ).toBeInTheDocument();
  });

  it("clears endDate error when user corrects to a valid date", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const earlyEnd = futureDate(5);
    const laterEnd = futureDate(15);

    // Set invalid dates
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: earlyEnd },
    });
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(/end date must be on or after start date/i),
    ).toBeInTheDocument();

    // Correct end date and trigger change event the way react-hook-form expects
    const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: laterEnd } });
    fireEvent.blur(endInput);

    // Wait for re-validation to clear the error
    await waitFor(
      () => {
        expect(
          screen.queryByText(/end date must be on or after/i),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows working day count excluding weekends", async () => {
    renderForm();

    await selectLeaveType(userEvent.setup());
    // Use a Monday and the following Sunday
    // Find next Monday
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    const monday = d.toISOString().slice(0, 10);
    const sunday = new Date(d);
    sunday.setDate(sunday.getDate() + 6);
    const sundayStr = sunday.toISOString().slice(0, 10);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: monday },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: sundayStr },
    });

    // Monday to Sunday = 5 working days
    expect(screen.getByText(/5 working days/i)).toBeInTheDocument();
  });

  it("shows 0.5 days when half-day first half is selected for same-day range", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const day = futureDate(10);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: day },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: day },
    });

    // Click "First half" in the half-day segmented control
    await user.click(screen.getByRole("radio", { name: /first half/i }));

    await waitFor(() => {
      expect(screen.getByText(/0\.5 working days/i)).toBeInTheDocument();
    });
  });

  it("hides half-day toggle when startDate !== endDate", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const end = futureDate(12);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });

    expect(
      screen.queryByRole("radiogroup", { name: /half.?day/i }),
    ).not.toBeInTheDocument();
  });

  it("shows insufficient balance error when balance < required days", async () => {
    mockBalanceData = [{ ...mockBalances[0], closing: 1 }];

    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    // Select 3+ working days
    const start = futureDate(10);
    const end = futureDate(14);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });

    expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit request/i })).toBeDisabled();
  });

  it("enables submit when all fields are valid", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const end = futureDate(11);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });

    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).not.toBeDisabled();
  });

  it("calls mutate with correct payload on valid submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const end = futureDate(12);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });

    // Type reason
    await user.type(screen.getByLabelText(/reason/i), "Family event");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          leaveTypeId: expect.any(String),
          startDate: start,
          endDate: end,
          halfDay: "full",
        }),
        expect.any(Object),
      );
    });
  });

  it("shows team capacity warning banner on 409 response", async () => {
    mockMutate.mockImplementation((_payload, { onError }) => {
      onError({
        response: {
          status: 409,
          data: { code: "ConflictException", canOverride: true },
        },
      });
    });

    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const end = futureDate(12);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(/team has reached capacity/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit anyway/i }),
    ).toBeInTheDocument();
  });

  it("submits with overrideCapacity: true when Submit anyway clicked", async () => {
    let callCount = 0;
    mockMutate.mockImplementation((payload, { onError, onSuccess }) => {
      callCount++;
      if (callCount === 1) {
        onError({
          response: {
            status: 409,
            data: { code: "ConflictException", canOverride: true },
          },
        });
      } else {
        onSuccess();
      }
    });

    const user = userEvent.setup();
    renderForm();

    await selectLeaveType(user);
    const start = futureDate(10);
    const end = futureDate(12);

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: end },
    });
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await screen.findByText(/team has reached capacity/i);

    await user.click(screen.getByRole("button", { name: /submit anyway/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenLastCalledWith(
        expect.objectContaining({ overrideCapacity: true }),
        expect.any(Object),
      );
    });
  });
});
