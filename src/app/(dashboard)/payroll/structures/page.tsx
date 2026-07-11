import React from "react";
import { SalaryStructureBuilder } from "@/features/payroll/components/SalaryStructureBuilder";

export default function SalaryStructuresPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Salary Structures</h1>
      <SalaryStructureBuilder />
    </div>
  );
}
