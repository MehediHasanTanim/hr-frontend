"use client";

import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useToastStore } from "@/stores/toast.store";
import {
  leaveTypeSchema,
  type LeaveTypeFormValues,
} from "@/features/leave/schemas/leave-type.schema";
import type { LeaveType } from "@/features/leave/types";
import { cn } from "@/lib/utils";

export function LeaveTypeFormDrawer({
  open,
  onClose,
  editLeaveType,
  onSubmitMutation,
}: {
  open: boolean;
  onClose: () => void;
  editLeaveType?: LeaveType | null;
  onSubmitMutation: (values: LeaveTypeFormValues) => void;
}) {
  const isEdit = Boolean(editLeaveType);
  const mutation = null;

  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      accrualType: "monthly",
      accrualAmount: 0,
      maxBalance: 30,
      maxCarryForward: 0,
      isPaid: true,
    },
  });

  const accrualType = form.watch("accrualType");
  const maxBalance = form.watch("maxBalance");

  useEffect(() => {
    if (editLeaveType) {
      form.reset({
        name: editLeaveType.name,
        code: editLeaveType.code,
        accrualType: editLeaveType.accrualType,
        accrualAmount: editLeaveType.accrualAmount,
        maxBalance: editLeaveType.maxBalance,
        maxCarryForward: editLeaveType.maxCarryForward,
        isPaid: editLeaveType.isPaid,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        accrualType: "monthly",
        accrualAmount: 0,
        maxBalance: 30,
        maxCarryForward: 0,
        isPaid: true,
      });
    }
  }, [editLeaveType, form]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = form;

  function onSubmit(values: LeaveTypeFormValues) {
    onSubmitMutation(values);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit leave type" : "Create leave type"}</SheetTitle>
          <SheetDescription>
            Configure leave type settings
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="lt-name">Name</Label>
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="lt-name"
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
            <Label htmlFor="lt-code">Code</Label>
            <Controller
              name="code"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="lt-code"
                  maxLength={30}
                  aria-invalid={Boolean(errors.code)}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase());
                  }}
                  value={field.value}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Used as identifier in reports and exports
            </p>
            {errors.code?.message && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Accrual Type */}
          <div className="space-y-2">
            <Label>Accrual Type</Label>
            <Controller
              name="accrualType"
              control={form.control}
              render={({ field }) => (
                <div
                  className="flex rounded-lg border border-input p-0.5"
                  role="radiogroup"
                  aria-label="Accrual type"
                >
                  {(["none", "monthly", "annual"] as const).map((option) => (
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
                      {option === "none"
                        ? "None"
                        : option === "monthly"
                          ? "Monthly"
                          : "Annual"}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Accrual Amount */}
          {accrualType !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="lt-accrual-amount">
                Days credited per {accrualType === "monthly" ? "month" : "year"}
              </Label>
              <Controller
                name="accrualAmount"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="lt-accrual-amount"
                    type="number"
                    min={0.5}
                    max={30}
                    step={0.5}
                    aria-invalid={Boolean(errors.accrualAmount)}
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                )}
              />
              {errors.accrualAmount?.message && (
                <p className="text-sm text-destructive">
                  {errors.accrualAmount.message}
                </p>
              )}
            </div>
          )}

          {/* Max Balance */}
          <div className="space-y-2">
            <Label htmlFor="lt-max-balance">
              Maximum days an employee can hold at any time
            </Label>
            <Controller
              name="maxBalance"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="lt-max-balance"
                  type="number"
                  min={1}
                  max={365}
                  step={0.5}
                  aria-invalid={Boolean(errors.maxBalance)}
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value))
                  }
                />
              )}
            />
            {errors.maxBalance?.message && (
              <p className="text-sm text-destructive">
                {errors.maxBalance.message}
              </p>
            )}
          </div>

          {/* Carry Forward */}
          <div className="space-y-2">
            <Label htmlFor="lt-carry-forward">
              Max days that carry into next year (0 = no carry)
            </Label>
            <Controller
              name="maxCarryForward"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="lt-carry-forward"
                  type="number"
                  min={0}
                  max={maxBalance}
                  step={0.5}
                  aria-invalid={Boolean(errors.maxCarryForward)}
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value))
                  }
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Set to 0 to lapse all unused balance at year end
            </p>
            {errors.maxCarryForward?.message && (
              <p className="text-sm text-destructive">
                {errors.maxCarryForward.message}
              </p>
            )}
          </div>

          {/* Paid Leave */}
          <div className="flex items-center gap-3">
            <Controller
              name="isPaid"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="lt-is-paid"
                />
              )}
            />
            <Label htmlFor="lt-is-paid">This is a paid leave type</Label>
          </div>

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
                "Create leave type"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
