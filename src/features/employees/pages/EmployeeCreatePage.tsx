"use client";

import { useRouter } from "next/navigation";

import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import { useCreateEmployeeMutation } from "@/features/employees/api/employeeApi";
import { useDepartmentsQuery } from "@/features/org/api/orgApi";
import type { EmployeeFormPayload } from "@/features/employees/types/employee.types";
import { readApiErrorMessage } from "@/lib/api-client";
import { useToastActions } from "@/stores/toast.store";

export function EmployeeCreatePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployeeMutation();
  const departments = useDepartmentsQuery();
  const { addToast } = useToastActions();

  function submit(values: EmployeeFormPayload) {
    createEmployee.mutate(values, {
      onSuccess: (employee) => {
        addToast({ message: "Employee created", variant: "success", duration: 3000 });
        router.push(`/employees/${employee.id}`);
      },
      onError: (error) => addToast({ message: readApiErrorMessage(error, "Unable to create employee"), variant: "danger", duration: 4000 }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create employee</h1>
        <p className="text-sm text-muted-foreground">Capture personal, employment, organization, and bank details.</p>
      </div>
      <EmployeeForm
        departments={(departments.data ?? []).map((department) => ({ id: department.id, name: department.name }))}
        isSaving={createEmployee.isPending}
        onSaveDraft={() => addToast({ message: "Draft saved locally for this session", variant: "info", duration: 3000 })}
        onSubmit={submit}
      />
    </div>
  );
}
