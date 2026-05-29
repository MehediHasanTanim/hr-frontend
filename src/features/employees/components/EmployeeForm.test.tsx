import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmployeeForm } from "@/features/employees/components/EmployeeForm";

const departments = [{ id: "hr", name: "HR" }];

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), "Tanvir");
  await user.type(screen.getByLabelText(/last name/i), "Ahmed");
  await user.type(screen.getByLabelText(/^email$/i), "tanvir@example.com");
  await user.type(screen.getByLabelText(/^phone$/i), "+8801712345678");
  await user.type(screen.getByLabelText(/employee number/i), "EMP-001");
  await user.selectOptions(screen.getByLabelText(/employee type/i), "full_time");
  await user.selectOptions(screen.getByLabelText(/employment status/i), "active");
  await user.type(screen.getByLabelText(/joining date/i), "2026-01-01");
  await user.selectOptions(screen.getByLabelText(/department/i), "hr");
  await user.type(screen.getByLabelText(/job title/i), "HR Manager");
  await user.type(screen.getByLabelText(/location/i), "Dhaka");
  await user.type(screen.getByLabelText(/account number/i), "1234567890");
}

describe("EmployeeForm", () => {
  it("shows required field validation errors", async () => {
    const user = userEvent.setup();
    render(<EmployeeForm departments={departments} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /save employee/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/employee number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/department is required/i)).toBeInTheDocument();
  });

  it("shows invalid email and phone errors", async () => {
    const user = userEvent.setup();
    render(<EmployeeForm departments={departments} onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/^email$/i), "not-email");
    await user.type(screen.getByLabelText(/^phone$/i), "abc");
    await user.click(screen.getByRole("button", { name: /save employee/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
  });

  it("submits a valid form successfully", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmployeeForm departments={departments} onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /save employee/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "Tanvir",
      employeeNumber: "EMP-001",
      departmentId: "hr",
    })));
  });

  it("requires bank account number", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmployeeForm departments={departments} onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText(/account number/i));
    await user.click(screen.getByRole("button", { name: /save employee/i }));

    expect(await screen.findByText(/account number is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables submit while saving", () => {
    render(<EmployeeForm departments={departments} isSaving onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
