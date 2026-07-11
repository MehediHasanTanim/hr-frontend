import React from "react";
import { PayrollCycleList } from "@/features/payroll/components/PayrollCycleList";

export default function PayrollCyclesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Payroll Cycles</h1>
      <PayrollCycleList />
    </div>
  );
}
