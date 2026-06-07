"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

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
import { useToastStore } from "@/stores/toast.store";
import { useSalaryStructures } from "@/features/payroll/api/salary-structures";
import { useAssignEmployeeSalary } from "@/features/payroll/api/employee-salary";
import {
  employeeSalarySchema,
  type EmployeeSalaryFormValues,
} from "@/features/payroll/schemas/employee-salary.schema";
import { LiveGrossPreview } from "@/features/payroll/components/LiveGrossPreview";
import type { ComponentOverride } from "@/features/payroll/types";

export function SalaryRevisionDrawer({
  open,
  onClose,
  employeeId,
}: {
  open: boolean;
  onClose: () => void;
  employeeId: string;
}) {
  const { addToast } = useToastStore();
  const { data: structures = [] } = useSalaryStructures();
  const assignMutation = useAssignEmployeeSalary(employeeId);
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const form = useForm<EmployeeSalaryFormValues>({
    resolver: zodResolver(employeeSalarySchema),
    defaultValues: {
      structureId: "",
      ctc: 0,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      notes: "",
      componentOverrides: [],
    },
  });

  const watchCtc = form.watch("ctc");
  const watchStructureId = form.watch("structureId");

  const selectedStructure = useMemo(
    () => structures.find((s) => s.id === watchStructureId),
    [structures, watchStructureId],
  );

  const monthlyCtc = watchCtc > 0 ? Math.round(watchCtc / 12) : 0;

  // Map overrides to component form
  const componentOverrides: ComponentOverride[] = useMemo(
    () =>
      Object.entries(overrides)
        .filter(([, v]) => v > 0)
        .map(([componentId, defaultValue]) => ({
          componentId,
          defaultValue,
        })),
    [overrides],
  );

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = form;

  useEffect(() => {
    if (open) {
      reset({
        structureId: "",
        ctc: 0,
        effectiveFrom: new Date().toISOString().slice(0, 10),
        notes: "",
        componentOverrides: [],
      });
      setOverrides({});
      setShowOverrides(false);
    }
  }, [open, reset]);

  function onSubmit(values: EmployeeSalaryFormValues) {
    assignMutation.mutate(
      { ...values, componentOverrides },
      {
        onSuccess: () => {
          addToast({
            message: "Salary assigned successfully",
            variant: "success",
          });
          onClose();
        },
        onError: (err: unknown) => {
          const axiosError = err as {
            response?: { status?: number };
          };
          if (axiosError?.response?.status === 409) {
            form.setError("effectiveFrom", {
              message: "A salary record already starts on this date",
            });
          } else {
            addToast({
              message: "Failed to assign salary",
              variant: "danger",
            });
          }
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assign / Revise Salary</SheetTitle>
          <SheetDescription>
            Set or update salary for this employee
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-5 px-4 py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Structure */}
          <div className="space-y-2">
            <Label htmlFor="sal-structure">Structure</Label>
            <Controller
              name="structureId"
              control={form.control}
              render={({ field }) => (
                <select
                  id="sal-structure"
                  className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setOverrides({});
                  }}
                >
                  <option value="">Select structure</option>
                  {structures
                    .filter((s) => s.isActive)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              )}
            />
            {errors.structureId?.message && (
              <p className="text-sm text-destructive">
                {errors.structureId.message}
              </p>
            )}
          </div>

          {/* Annual CTC */}
          <div className="space-y-2">
            <Label htmlFor="sal-ctc">Annual CTC (₹)</Label>
            <Controller
              name="ctc"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sal-ctc"
                  type="number"
                  min={12000}
                  max={100_000_000}
                  step={1000}
                  aria-invalid={Boolean(errors.ctc)}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              )}
            />
            {errors.ctc?.message && (
              <p className="text-sm text-destructive">{errors.ctc.message}</p>
            )}
            {watchCtc > 0 && (
              <p className="text-sm text-muted-foreground">
                Monthly: ₹{monthlyCtc.toLocaleString("en-IN")}
                {watchCtc % 12 !== 0 && (
                  <span className="ml-2 text-amber-600">
                    — Monthly CTC will be ₹
                    {(watchCtc / 12).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                    . Consider adjusting to a round number.
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="sal-eff-date">Effective Date</Label>
            <Controller
              name="effectiveFrom"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sal-eff-date"
                  type="date"
                  aria-invalid={Boolean(errors.effectiveFrom)}
                  {...field}
                />
              )}
            />
            {errors.effectiveFrom?.message && (
              <p className="text-sm text-destructive">
                {errors.effectiveFrom.message}
              </p>
            )}
            {watchCtc > 0 &&
              watchCtc % 12 !== 0 && (
                <p className="text-xs text-amber-600">
                  Payroll for the month containing this date will use the
                  previous salary until month end, and the new salary from
                  the next cycle.
                </p>
              )}
          </div>

          {/* Component Overrides */}
          {selectedStructure && (
            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setShowOverrides(!showOverrides)}
              >
                {showOverrides ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                Show component overrides
              </button>

              {showOverrides && (
                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use the structure&apos;s default amounts.
                  </p>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="pb-1 font-medium">Component</th>
                        <th className="pb-1 font-medium">Default</th>
                        <th className="pb-1 font-medium">Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedStructure.components.map((sc) => (
                        <tr key={sc.componentId}>
                          <td className="py-1">{sc.component.name}</td>
                          <td className="py-1 text-muted-foreground">
                            ₹
                            {sc.defaultValue.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-1">
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              className="h-6 w-24 text-xs"
                              placeholder="Use default"
                              value={overrides[sc.componentId] ?? ""}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setOverrides((prev) => ({
                                  ...prev,
                                  [sc.componentId]: val || 0,
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="sal-notes">Notes</Label>
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <textarea
                  id="sal-notes"
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
          </div>

          {/* Live Preview */}
          {selectedStructure && watchCtc > 0 && (
            <LiveGrossPreview
              components={selectedStructure.components.map((sc) => ({
                ...sc,
                defaultValue: overrides[sc.componentId] ?? sc.defaultValue,
              }))}
              monthlyCTC={monthlyCtc}
            />
          )}

          <SheetFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Assign Salary"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
