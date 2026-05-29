"use client";

import { useMemo, useState } from "react";
import { Edit, Plus, Power } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Department } from "@/features/org/types/org.types";
import type { DepartmentValues } from "@/features/org/schemas/org.schema";

const emptyDepartment: DepartmentValues = { name: "", code: "", parentId: "", headId: "", status: "active" };

function flattenDepartments(departments: Department[], blockedId?: string): Department[] {
  return departments.flatMap((department) => [
    department,
    ...flattenDepartments(department.children ?? [], blockedId),
  ]).filter((department) => department.id !== blockedId);
}

function DepartmentNode({
  department,
  level = 0,
  onEdit,
  onDeactivate,
}: {
  department: Department;
  level?: number;
  onEdit: (department: Department) => void;
  onDeactivate: (department: Department) => void;
}) {
  return (
    <li>
      <div className="flex items-center justify-between gap-3 border-b py-3" style={{ paddingLeft: level * 20 }}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{department.name}</p>
            <Badge variant={department.status === "active" ? "default" : "outline"}>{department.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{department.headName ? `Head: ${department.headName}` : "No department head"}</p>
        </div>
        <div className="flex gap-1">
          <Button aria-label={`Edit ${department.name}`} size="icon-sm" type="button" variant="ghost" onClick={() => onEdit(department)}><Edit className="size-4" /></Button>
          <Button aria-label={`Deactivate ${department.name}`} disabled={department.status === "inactive"} size="icon-sm" type="button" variant="destructive" onClick={() => onDeactivate(department)}><Power className="size-4" /></Button>
        </div>
      </div>
      {department.children?.length ? (
        <ul>
          {department.children.map((child) => (
            <DepartmentNode key={child.id} department={child} level={level + 1} onDeactivate={onDeactivate} onEdit={onEdit} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DepartmentTreeList({
  departments,
  isSaving,
  onSave,
  onDeactivate,
}: {
  departments: Department[];
  isSaving?: boolean;
  onSave: (id: string | null, values: DepartmentValues) => void;
  onDeactivate: (department: Department) => void;
}) {
  const [editing, setEditing] = useState<Department | null>(null);
  const [values, setValues] = useState<DepartmentValues>(emptyDepartment);
  const selectableParents = useMemo(() => flattenDepartments(departments, editing?.id), [departments, editing?.id]);

  function edit(department: Department | null) {
    setEditing(department);
    setValues(department ? {
      name: department.name,
      code: department.code ?? "",
      parentId: department.parentId ?? "",
      headId: department.headId ?? "",
      status: department.status,
    } : emptyDepartment);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border">
        {departments.length ? (
          <ul>{departments.map((department) => <DepartmentNode key={department.id} department={department} onDeactivate={onDeactivate} onEdit={edit} />)}</ul>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No departments found.</div>
        )}
      </div>
      <form
        className="space-y-4 rounded-lg border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(editing?.id ?? null, values);
          if (!editing) {
            setValues(emptyDepartment);
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{editing ? "Edit department" : "Add department"}</h2>
          <Button size="sm" type="button" variant="outline" onClick={() => edit(null)}><Plus className="size-4" /> New</Button>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-medium">Department name</span>
          <Input required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Code</span>
          <Input value={values.code ?? ""} onChange={(event) => setValues({ ...values, code: event.target.value })} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Parent department</span>
          <select aria-label="Parent department" className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm" value={values.parentId ?? ""} onChange={(event) => setValues({ ...values, parentId: event.target.value })}>
            <option value="">No parent</option>
            {selectableParents.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select aria-label="Status" className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as DepartmentValues["status"] })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <Button className="w-full" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save department"}</Button>
      </form>
    </div>
  );
}
