"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeProfileTabs } from "@/features/employees/components/EmployeeProfileTabs";
import { useEmployeeQuery, useEmploymentHistoryQuery } from "@/features/employees/api/employeeApi";

export function EmployeeProfilePage({ id }: { id: string }) {
  const employee = useEmployeeQuery(id);
  const history = useEmploymentHistoryQuery(id);

  if (employee.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (employee.error || !employee.data) {
    return <div className="rounded-lg border p-6 text-danger">Unable to load employee profile.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{employee.data.firstName} {employee.data.lastName}</h1>
            <Badge>{employee.data.status.replaceAll("_", " ")}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{employee.data.employeeNumber} · {employee.data.jobTitle ?? "No job title"}</p>
        </div>
        <Button render={<Link href={`/employees/${id}/edit`} />}><Pencil className="size-4" /> Edit</Button>
      </div>
      <EmployeeProfileTabs employee={employee.data} history={history.data ?? []} />
    </div>
  );
}
