"use client";

import { useState } from "react";
import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import {
  useDeleteSalaryStructure,
  useSalaryStructures,
} from "@/features/payroll/api/salary-structures";

export default function SalaryStructuresPage() {
  const { addToast } = useToastStore();
  const { data: structures = [], isLoading, error } = useSalaryStructures();
  const deleteMutation = useDeleteSalaryStructure();

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete "${name}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        addToast({ message: "Structure deleted", variant: "success" });
      },
      onError: () => {
        addToast({ message: "Failed to delete", variant: "danger" });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Salary Structures</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage salary templates
          </p>
        </div>
        <Link href="/payroll/structures/new">
          <Button size="sm" type="button">
            <Plus className="mr-1 size-4" />
            New Structure
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load structures
        </div>
      ) : structures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No salary structures yet
          </p>
          <Link href="/payroll/structures/new">
            <Button className="mt-3" size="sm" type="button">
              Create your first structure
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Components</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {structures.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-3 py-3 font-medium">{s.name}</td>
                  <td className="px-3 py-3">
                    {s.components?.length ?? 0} components
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={s.isActive ? "default" : "outline"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/payroll/structures/${s.id}/edit`}>
                        <Button size="icon-sm" type="button" variant="ghost" aria-label="Edit">
                          <Edit3 className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        aria-label="Delete"
                        onClick={() => handleDelete(s.id, s.name)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
