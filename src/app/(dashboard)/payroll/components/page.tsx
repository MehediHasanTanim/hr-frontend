import React from "react";
import { SalaryComponentsTable } from "@/features/payroll/components/SalaryComponentsTable";

export default function SalaryComponentsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Salary Components</h1>
      <SalaryComponentsTable />
    </div>
  );
}
