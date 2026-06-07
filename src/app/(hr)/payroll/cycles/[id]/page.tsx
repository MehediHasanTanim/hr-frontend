"use client";

import { useParams } from "next/navigation";

import { PayrollCycleDetail } from "@/features/payroll/components/PayrollCycleDetail";

export default function PayrollCycleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <PayrollCycleDetail cycleId={id} />
    </div>
  );
}
