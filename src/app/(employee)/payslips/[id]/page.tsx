"use client";

import { useParams } from "next/navigation";

import { PayslipViewer } from "@/features/payroll/components/PayslipViewer";

export default function EmployeePayslipDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <PayslipViewer payslipId={id} />;
}
