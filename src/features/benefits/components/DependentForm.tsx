// src/features/benefits/components/DependentForm.tsx
// Sprint 10 F1 — Dependent Entry Form (React Hook Form + Zod)

"use client";

import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SubmitEnrollmentFormValues } from "@/features/benefits/schemas/enrollment.schema";

const RELATIONSHIP_OPTIONS = [
  { value: "SPOUSE", label: "Spouse" },
  { value: "CHILD", label: "Child" },
  { value: "DOMESTIC_PARTNER", label: "Domestic Partner" },
  { value: "OTHER", label: "Other" },
];

export function DependentForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SubmitEnrollmentFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });

  return (
    <div data-testid="dependent-form" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dependents</h3>
        <button
          type="button"
          data-testid="add-dependent-btn"
          onClick={() =>
            append({
              fullName: "",
              relationship: "SPOUSE",
              dateOfBirth: "",
            })
          }
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Dependent
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No dependents added. Click &quot;Add Dependent&quot; if applicable.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          data-testid={`dependent-row-${index}`}
          className="rounded-lg border p-4 space-y-3 relative"
        >
          <button
            type="button"
            data-testid={`remove-dependent-${index}`}
            onClick={() => remove(index)}
            className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Remove dependent"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <Input
              {...register(`dependents.${index}.fullName`)}
              data-testid={`dependent-name-${index}`}
              placeholder="Full name"
            />
            {errors.dependents?.[index]?.fullName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.dependents[index]?.fullName?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Relationship
            </label>
            <select
              {...register(`dependents.${index}.relationship`)}
              data-testid={`dependent-relationship-${index}`}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <Input
              type="date"
              {...register(`dependents.${index}.dateOfBirth`)}
              data-testid={`dependent-dob-${index}`}
            />
            {errors.dependents?.[index]?.dateOfBirth && (
              <p className="mt-1 text-xs text-destructive">
                {errors.dependents[index]?.dateOfBirth?.message}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
