"use client";

import { PayrollCycleList } from "@/features/payroll/components/PayrollCycleList";

export default function PayrollCyclesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payroll Cycles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage payroll periods, run computations, and approve disbursements
        </p>
      </div>
      <PayrollCycleList />
    </div>
  );
}
