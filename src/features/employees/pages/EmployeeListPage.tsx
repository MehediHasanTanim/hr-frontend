"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import { parseEmployeeQuery, serializeEmployeeQuery, useDeleteEmployeeMutation, useEmployeesQuery } from "@/features/employees/api/employeeApi";
import { useDepartmentsQuery } from "@/features/org/api/orgApi";
import type { EmployeeListQuery, EmployeeSummary } from "@/features/employees/types/employee.types";
import { readApiErrorMessage } from "@/lib/api-client";
import { useToastActions } from "@/stores/toast.store";

export function EmployeeListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseEmployeeQuery(searchParams);
  const employees = useEmployeesQuery(query);
  const departments = useDepartmentsQuery();
  const deleteEmployee = useDeleteEmployeeMutation();
  const { addToast } = useToastActions();

  function setQuery(nextQuery: EmployeeListQuery) {
    const params = serializeEmployeeQuery(nextQuery);
    router.push(params ? `/employees?${params}` : "/employees");
  }

  function handleDelete(employee: EmployeeSummary) {
    if (!window.confirm(`Deactivate ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }
    deleteEmployee.mutate(employee.id, {
      onSuccess: () => addToast({ message: "Employee deactivated", variant: "success", duration: 3000 }),
      onError: (error) => addToast({ message: readApiErrorMessage(error, "Unable to deactivate employee"), variant: "danger", duration: 4000 }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage employee records, assignments, and lifecycle status.</p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href="/employees/import" />} variant="outline"><Upload className="size-4" /> Import</Button>
          <Button render={<Link href="/employees/create" />}><UserPlus className="size-4" /> Add employee</Button>
        </div>
      </div>
      <EmployeeTable
        data={employees.data}
        departments={(departments.data ?? []).map((department) => ({ id: department.id, name: department.name }))}
        error={employees.error}
        isLoading={employees.isLoading}
        query={query}
        onDelete={handleDelete}
        onQueryChange={setQuery}
      />
    </div>
  );
}
