"use client";

import { useParams } from "next/navigation";

import { EmployeeSalaryForm } from "@/features/payroll/components/EmployeeSalaryForm";

export default function EmployeeSalaryPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Salary Details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage salary assignment
        </p>
      </div>
      <EmployeeSalaryForm employeeId={id} />
    </div>
  );
}
