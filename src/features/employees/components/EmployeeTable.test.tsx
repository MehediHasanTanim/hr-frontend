import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { defaultEmployeeQuery } from "@/features/employees/api/employeeApi";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import type { EmployeeListQuery, EmployeeListResponse } from "@/features/employees/types/employee.types";

const data: EmployeeListResponse = {
  data: [{
    id: "1",
    firstName: "Tanvir",
    lastName: "Ahmed",
    employeeNumber: "EMP-001",
    email: "tanvir@example.com",
    departmentId: "hr",
    departmentName: "HR",
    jobTitle: "HR Manager",
    status: "active",
    employeeType: "full_time",
    location: "Dhaka",
    joiningDate: "2026-01-01",
  }],
  total: 25,
  page: 1,
  pageSize: 10,
};

function renderTable(query: EmployeeListQuery = defaultEmployeeQuery) {
  const onQueryChange = vi.fn();
  render(
    <EmployeeTable
      data={data}
      departments={[{ id: "hr", name: "HR" }]}
      query={query}
      onQueryChange={onQueryChange}
    />,
  );
  return onQueryChange;
}

describe("EmployeeTable", () => {
  it("updates query state for department filter", async () => {
    const user = userEvent.setup();
    const onQueryChange = renderTable();

    await user.selectOptions(screen.getByLabelText(/department/i), "hr");

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ departmentId: "hr", page: 1 }));
  });

  it("updates query state for status filter", async () => {
    const user = userEvent.setup();
    const onQueryChange = renderTable();

    await user.selectOptions(screen.getByLabelText(/^status$/i), "active");

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ status: "active", page: 1 }));
  });

  it("updates query state for employee type filter", async () => {
    const user = userEvent.setup();
    const onQueryChange = renderTable();

    await user.selectOptions(screen.getByLabelText(/employee type/i), "full_time");

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ employeeType: "full_time", page: 1 }));
  });

  it("updates query state for search input", async () => {
    const user = userEvent.setup();
    const onQueryChange = renderTable();

    await user.type(screen.getByLabelText(/search employees/i), "tan");

    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: "tan", page: 1 }));
  });

  it("updates query state for pagination", async () => {
    const user = userEvent.setup();
    const onQueryChange = renderTable();

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("updates query state for sorting", async () => {
    const user = userEvent.setup();
    const onQueryChange = renderTable();

    await user.click(screen.getByRole("button", { name: /employee number/i }));

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ sortBy: "employeeNumber", sortOrder: "asc", page: 1 }));
  });

  it("renders empty state", () => {
    render(
      <EmployeeTable
        data={{ ...data, data: [], total: 0 }}
        query={defaultEmployeeQuery}
        onQueryChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
  });
});
