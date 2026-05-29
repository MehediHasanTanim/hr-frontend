"use client";

import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import { useEmployeeQuery, useUpdateEmployeeMutation } from "@/features/employees/api/employeeApi";
import { useDepartmentsQuery } from "@/features/org/api/orgApi";
import type { EmployeeFormPayload } from "@/features/employees/types/employee.types";
import { readApiErrorMessage } from "@/lib/api-client";
import { useToastActions } from "@/stores/toast.store";

export function EmployeeEditPage({ id }: { id: string }) {
  const router = useRouter();
  const employee = useEmployeeQuery(id);
  const updateEmployee = useUpdateEmployeeMutation(id);
  const departments = useDepartmentsQuery();
  const { addToast } = useToastActions();

  function submit(values: EmployeeFormPayload) {
    updateEmployee.mutate(values, {
      onSuccess: () => {
        addToast({ message: "Employee updated", variant: "success", duration: 3000 });
        router.push(`/employees/${id}`);
      },
      onError: (error) => addToast({ message: readApiErrorMessage(error, "Unable to update employee"), variant: "danger", duration: 4000 }),
    });
  }

  if (employee.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (employee.error || !employee.data) {
    return <div className="rounded-lg border p-6 text-danger">Unable to load employee.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit employee</h1>
        <p className="text-sm text-muted-foreground">Update {employee.data.firstName} {employee.data.lastName}.</p>
      </div>
      <EmployeeForm
        employee={employee.data}
        departments={(departments.data ?? []).map((department) => ({ id: department.id, name: department.name }))}
        isSaving={updateEmployee.isPending}
        onSubmit={submit}
      />
    </div>
  );
}
