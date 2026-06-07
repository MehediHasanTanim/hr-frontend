"use client";

import { useParams, useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useSalaryStructure } from "@/features/payroll/api/salary-structures";
import { SalaryStructureBuilder } from "@/features/payroll/components/SalaryStructureBuilder";

export default function EditSalaryStructurePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: structure, isLoading, error } = useSalaryStructure(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load structure
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Salary Structure</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modify &quot;{structure.name}&quot;
        </p>
      </div>
      <SalaryStructureBuilder
        editStructure={structure}
        onSuccess={() => router.push("/payroll/structures")}
      />
    </div>
  );
}
