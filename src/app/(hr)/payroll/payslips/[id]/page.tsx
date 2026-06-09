"use client";

import { useParams } from "next/navigation";

import { PayslipViewer } from "@/features/payroll/components/PayslipViewer";

export default function PayslipDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payslip</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View payslip details and download PDF
        </p>
      </div>
      <PayslipViewer payslipId={id} isHrView />
    </div>
  );
}
