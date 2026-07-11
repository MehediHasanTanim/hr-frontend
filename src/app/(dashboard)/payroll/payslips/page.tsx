import React from "react";
import { PayslipList } from "@/features/payroll/components/PayslipList";

export default function PayslipsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Payslips</h1>
      <PayslipList />
    </div>
  );
}
