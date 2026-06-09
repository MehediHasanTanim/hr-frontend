"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  salaryComponentSchema,
  type SalaryComponentFormValues,
} from "@/features/payroll/schemas/salary-component.schema";
import { FormulaInput } from "@/features/payroll/components/FormulaInput";
import type { SalaryComponent } from "@/features/payroll/types";
import { cn } from "@/lib/utils";

export function SalaryComponentFormDrawer({
  open,
  onClose,
  editComponent,
  knownCodes,
  onSubmitMutation,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  editComponent?: SalaryComponent | null;
  knownCodes: string[];
  onSubmitMutation: (values: SalaryComponentFormValues) => void;
  isSubmitting?: boolean;
}) {
  const isEdit = Boolean(editComponent);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  const form = useForm<SalaryComponentFormValues>({
    resolver: zodResolver(salaryComponentSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "earning",
      calculationType: "fixed",
      formula: null,
    },
  });

  const watchCalc = form.watch("calculationType");
  const watchName = form.watch("name");

  useEffect(() => {
    if (editComponent) {
      form.reset({
        name: editComponent.name,
        code: editComponent.code,
        type: editComponent.type,
        calculationType: editComponent.calculationType,
        formula: editComponent.formula,
      });
      setCodeManuallyEdited(true);
    } else {
      form.reset({
        name: "",
        code: "",
        type: "earning",
        calculationType: "fixed",
        formula: null,
      });
      setCodeManuallyEdited(false);
    }
  }, [editComponent, form]);

  // Auto-generate code from name
  useEffect(() => {
    if (!isEdit && !codeManuallyEdited && watchName) {
      const generated = watchName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
      form.setValue("code", generated);
    }
  }, [watchName, codeManuallyEdited, isEdit, form]);

  const {
    formState: { errors },
    handleSubmit,
  } = form;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-[440px] sm:max-w-[440px]">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit component" : "Add component"}
          </SheetTitle>
          <SheetDescription>
            Configure salary component
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
          onSubmit={handleSubmit(onSubmitMutation)}
        >
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="sc-name">Name</Label>
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sc-name"
                  maxLength={100}
                  aria-invalid={Boolean(errors.name)}
                  {...field}
                />
              )}
            />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="sc-code">Code</Label>
            <Controller
              name="code"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sc-code"
                  maxLength={30}
                  className="font-mono uppercase"
                  disabled={isEdit}
                  aria-invalid={Boolean(errors.code)}
                  onChange={(e) => {
                    setCodeManuallyEdited(true);
                    field.onChange(e.target.value.toUpperCase());
                  }}
                  value={field.value}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Used in formula references. Cannot be changed after
              components are used in a structure.
            </p>
            {errors.code?.message && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <div
                  className="flex rounded-lg border border-input p-0.5"
                  role="radiogroup"
                  aria-label="Component type"
                >
                  {(
                    [
                      "earning",
                      "deduction",
                      "employer_contribution",
                    ] as const
                  ).map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={field.value === option}
                      className={cn(
                        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        field.value === option
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => field.onChange(option)}
                    >
                      {option === "earning"
                        ? "Earning"
                        : option === "deduction"
                          ? "Deduction"
                          : "Employer Contribution"}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Calculation Type */}
          <div className="space-y-2">
            <Label>Calculation Type</Label>
            <Controller
              name="calculationType"
              control={form.control}
              render={({ field }) => (
                <div
                  className="flex rounded-lg border border-input p-0.5"
                  role="radiogroup"
                  aria-label="Calculation type"
                >
                  {(["fixed", "formula", "percentage_of_base"] as const).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={field.value === option}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          field.value === option
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => field.onChange(option)}
                      >
                        {option === "fixed"
                          ? "Fixed"
                          : option === "formula"
                            ? "Formula"
                            : "% of Base"}
                      </button>
                    ),
                  )}
                </div>
              )}
            />
          </div>

          {/* Conditional fields */}
          {watchCalc === "formula" && (
            <div className="space-y-2">
              <Label htmlFor="sc-formula">Formula</Label>
              <Controller
                name="formula"
                control={form.control}
                render={({ field }) => (
                  <FormulaInput
                    formula={field.value ?? ""}
                    knownCodes={knownCodes}
                    onChange={(v) => field.onChange(v || null)}
                    error={errors.formula?.message}
                  />
                )}
              />
            </div>
          )}

          {watchCalc === "fixed" && (
            <p className="text-xs text-muted-foreground">
              Amount is configured per salary structure.
            </p>
          )}

          {watchCalc === "percentage_of_base" && (
            <p className="text-xs text-muted-foreground">
              Will be calculated as a percentage of the BASIC component.
              Set the percentage in each salary structure.
            </p>
          )}

          <SheetFooter className="mt-auto border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add component"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
