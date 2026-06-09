"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SalaryStructureBuilder } from "@/features/payroll/components/SalaryStructureBuilder";
import { useSalaryStructure } from "@/features/payroll/api/salary-structures";

export default function EditSalaryStructurePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: structure, isLoading, error } = useSalaryStructure(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load structure
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => router.push("/payroll/structures")}
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to Structures
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="mb-2 -ml-2"
          onClick={() => router.push("/payroll/structures")}
        >
          <ArrowLeft className="mr-1 size-4" />
          Salary Structures
        </Button>
        <h1 className="text-2xl font-semibold">Edit Salary Structure</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modify the component layout for &quot;{structure.name}&quot;
        </p>
      </div>
      <SalaryStructureBuilder
        editStructure={structure}
        onSuccess={() => router.push("/payroll/structures")}
      />
    </div>
  );
}
