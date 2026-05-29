"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, Pencil, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { EmployeeListQuery, EmployeeListResponse, EmployeeSummary, SortOrder } from "@/features/employees/types/employee.types";

const statusOptions = ["active", "inactive", "on_leave", "terminated"];
const typeOptions = ["full_time", "part_time", "contractor", "intern"];

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function NativeSelect({
  labelText,
  value,
  options,
  onChange,
}: {
  labelText: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{labelText}</span>
      <select
        aria-label={labelText}
        className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function EmployeeTable({
  query,
  data,
  isLoading = false,
  error,
  departments = [],
  onQueryChange,
  onDelete,
}: {
  query: EmployeeListQuery;
  data?: EmployeeListResponse | undefined;
  isLoading?: boolean;
  error?: unknown;
  departments?: { id: string; name: string }[] | undefined;
  onQueryChange: (query: EmployeeListQuery) => void;
  onDelete?: (employee: EmployeeSummary) => void;
}) {
  const [searchDraft, setSearchDraft] = useState(query.search);
  const employees = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / query.pageSize));

  useEffect(() => {
    setSearchDraft(query.search);
  }, [query.search]);

  function patchQuery(patch: Partial<EmployeeListQuery>) {
    onQueryChange({ ...query, ...patch });
  }

  function sortBy(column: string) {
    const sortOrder: SortOrder = query.sortBy === column && query.sortOrder === "asc" ? "desc" : "asc";
    patchQuery({ sortBy: column, sortOrder, page: 1 });
  }

  const sortableHeader = (column: string, title: string) => (
    <button className="inline-flex items-center gap-1 font-medium" type="button" onClick={() => sortBy(column)}>
      {title}
      {query.sortBy === column ? (
        query.sortOrder === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
      ) : null}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_160px]">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Search employees</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2 size-4 text-muted-foreground" />
            <Input
              aria-label="Search employees"
              className="pl-8"
              placeholder="Name, email, or employee number"
              value={searchDraft}
              onChange={(event) => {
                setSearchDraft(event.target.value);
                patchQuery({ search: event.target.value, page: 1 });
              }}
            />
          </div>
        </label>
        <NativeSelect
          labelText="Department"
          value={query.departmentId}
          options={[{ value: "", label: "All departments" }, ...departments.map((department) => ({ value: department.id, label: department.name }))]}
          onChange={(departmentId) => patchQuery({ departmentId, page: 1 })}
        />
        <NativeSelect
          labelText="Status"
          value={query.status}
          options={[{ value: "", label: "All statuses" }, ...statusOptions.map((option) => ({ value: option, label: label(option) }))]}
          onChange={(status) => patchQuery({ status, page: 1 })}
        />
        <NativeSelect
          labelText="Employee type"
          value={query.employeeType}
          options={[{ value: "", label: "All types" }, ...typeOptions.map((option) => ({ value: option, label: label(option) }))]}
          onChange={(employeeType) => patchQuery({ employeeType, page: 1 })}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{sortableHeader("name", "Employee name")}</th>
              <th className="px-3 py-2">{sortableHeader("employeeNumber", "Employee number")}</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Job title</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Employee type</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">{sortableHeader("joiningDate", "Joining date")}</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-3 py-3" colSpan={10}><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))
            ) : error ? (
              <tr><td className="px-3 py-8 text-center text-danger" colSpan={10}>Unable to load employees.</td></tr>
            ) : employees.length === 0 ? (
              <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={10}>No employees found.</td></tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-muted/40">
                  <td className="px-3 py-3 font-medium">{employee.firstName} {employee.lastName}</td>
                  <td className="px-3 py-3">{employee.employeeNumber}</td>
                  <td className="px-3 py-3">{employee.email}</td>
                  <td className="px-3 py-3">{employee.departmentName ?? "-"}</td>
                  <td className="px-3 py-3">{employee.jobTitle ?? "-"}</td>
                  <td className="px-3 py-3"><Badge variant={employee.status === "active" ? "default" : "outline"}>{label(employee.status)}</Badge></td>
                  <td className="px-3 py-3">{label(employee.employeeType)}</td>
                  <td className="px-3 py-3">{employee.location ?? "-"}</td>
                  <td className="px-3 py-3">{employee.joiningDate}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <Button aria-label={`View ${employee.firstName}`} render={<Link href={`/employees/${employee.id}`} />} size="icon-sm" variant="ghost"><Eye className="size-4" /></Button>
                      <Button aria-label={`Edit ${employee.firstName}`} render={<Link href={`/employees/${employee.id}/edit`} />} size="icon-sm" variant="ghost"><Pencil className="size-4" /></Button>
                      <Button aria-label={`Deactivate ${employee.firstName}`} size="icon-sm" type="button" variant="destructive" onClick={() => onDelete?.(employee)}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {query.page} of {totalPages} · {data?.total ?? 0} employees
        </p>
        <div className="flex items-center gap-2">
          <Button disabled={query.page <= 1} type="button" variant="outline" onClick={() => patchQuery({ page: query.page - 1 })}>Previous</Button>
          <Button disabled={query.page >= totalPages} type="button" variant="outline" onClick={() => patchQuery({ page: query.page + 1 })}>Next</Button>
          <select
            aria-label="Rows per page"
            className={cn("h-8 rounded-lg border border-input bg-background px-2 text-sm")}
            value={query.pageSize}
            onChange={(event) => patchQuery({ pageSize: Number(event.target.value), page: 1 })}
          >
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
