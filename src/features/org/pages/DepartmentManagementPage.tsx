"use client";

import { DepartmentTreeList } from "@/features/org/components/DepartmentTreeList";
import { useCreateDepartmentMutation, useDeactivateDepartmentMutation, useDepartmentsQuery, useUpdateDepartmentMutation } from "@/features/org/api/orgApi";
import type { DepartmentValues } from "@/features/org/schemas/org.schema";
import type { Department } from "@/features/org/types/org.types";
import { readApiErrorMessage } from "@/lib/api-client";
import { useToastActions } from "@/stores/toast.store";

export function DepartmentManagementPage() {
  const departments = useDepartmentsQuery();
  const createDepartment = useCreateDepartmentMutation();
  const updateDepartment = useUpdateDepartmentMutation();
  const deactivateDepartment = useDeactivateDepartmentMutation();
  const { addToast } = useToastActions();

  function save(id: string | null, values: DepartmentValues) {
    const options = {
      onSuccess: () => addToast({ message: "Department saved", variant: "success", duration: 3000 }),
      onError: (error: unknown) => addToast({ message: readApiErrorMessage(error, "Unable to save department"), variant: "danger", duration: 4000 }),
    };
    if (id) {
      updateDepartment.mutate({ id, payload: values }, options);
      return;
    }
    createDepartment.mutate(values, options);
  }

  function deactivate(department: Department) {
    if (!window.confirm(`Deactivate ${department.name}?`)) {
      return;
    }
    deactivateDepartment.mutate(department.id, {
      onSuccess: () => addToast({ message: "Department deactivated", variant: "success", duration: 3000 }),
      onError: (error) => addToast({ message: readApiErrorMessage(error, "Unable to deactivate department"), variant: "danger", duration: 4000 }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Departments</h1>
        <p className="text-sm text-muted-foreground">Maintain department hierarchy, heads, and active status.</p>
      </div>
      {departments.error ? <div className="rounded-lg border p-6 text-danger">Unable to load departments.</div> : null}
      <DepartmentTreeList
        departments={departments.data ?? []}
        isSaving={createDepartment.isPending || updateDepartment.isPending}
        onDeactivate={deactivate}
        onSave={save}
      />
    </div>
  );
}
