"use client";

import { useRouter } from "next/navigation";

import { SalaryStructureBuilder } from "@/features/payroll/components/SalaryStructureBuilder";

export default function NewSalaryStructurePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Salary Structure</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the component layout for a new salary template
        </p>
      </div>
      <SalaryStructureBuilder onSuccess={() => router.push("/payroll/structures")} />
    </div>
  );
}
