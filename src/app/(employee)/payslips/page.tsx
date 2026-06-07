"use client";

import { PayslipList } from "@/features/payroll/components/PayslipList";

export default function EmployeePayslipsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Payslips</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and download your payslips
        </p>
      </div>
      <PayslipList />
    </div>
  );
}
