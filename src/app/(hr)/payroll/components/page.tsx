"use client";

import { SalaryComponentsTable } from "@/features/payroll/components/SalaryComponentsTable";

export default function SalaryComponentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Salary Components</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage salary components, formulas, and calculations
        </p>
      </div>
      <SalaryComponentsTable />
    </div>
  );
}
