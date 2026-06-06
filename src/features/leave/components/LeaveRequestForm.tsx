"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/stores/toast.store";
import {
  leaveRequestSchema,
  type LeaveRequestFormValues,
} from "@/features/leave/schemas/leave-request.schema";
import {
  useCreateLeaveRequest,
  useLeaveBalances,
  useLeaveTypes,
} from "@/features/leave/api/leaveApi";
import type { HalfDay } from "@/features/leave/types";
import { cn } from "@/lib/utils";

function getWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function formatHour(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}m`;
  return `${min}m`;
}

export function LeaveRequestForm() {
  const { addToast } = useToastStore();
  const [selectedYear] = useState(() => new Date().getFullYear());
  const [capacityWarning, setCapacityWarning] = useState(false);
  const [serverInsufficientBalance, setServerInsufficientBalance] = useState(false);

  const { data: leaveTypes = [], isLoading: typesLoading } = useLeaveTypes();
  const { data: balances = [] } = useLeaveBalances(selectedYear);
  const { mutate, isPending, error: mutationError } = useCreateLeaveRequest();

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      halfDay: "full",
      reason: "",
    },
    mode: "onChange",
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const halfDay = form.watch("halfDay");
  const leaveTypeId = form.watch("leaveTypeId");
  const reason = form.watch("reason");

  const selectedLeaveType = useMemo(
    () => leaveTypes.find((lt) => lt.id === leaveTypeId),
    [leaveTypes, leaveTypeId],
  );

  const selectedBalance = useMemo(
    () => balances.find((b) => b.leaveTypeId === leaveTypeId),
    [balances, leaveTypeId],
  );

  const isSameDay =
    startDate && endDate ? startDate === endDate : false;

  // Working days computation
  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    if (end < start) return 0;
    const raw = getWorkingDays(start, end);
    if (isSameDay && halfDay !== "full") {
      return 0.5;
    }
    return raw;
  }, [startDate, endDate, isSameDay, halfDay]);

  const requiredBalance = workingDays;

  // React to startDate changes: if endDate is now before startDate, clear it
  useEffect(() => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      form.setValue("endDate", "" as const);
    }
  }, [startDate]);

  // Reset halfDay when dates change and not same day
  useEffect(() => {
    if (!isSameDay && halfDay !== "full") {
      form.setValue("halfDay", "full");
    }
  }, [isSameDay, halfDay, form]);

  // Clear server balance error when leave type or dates change
  useEffect(() => {
    setServerInsufficientBalance(false);
  }, [leaveTypeId, startDate, endDate]);

  const balanceInsufficient =
    selectedBalance != null && selectedBalance.closing < requiredBalance;

  const submitDisabled =
    isPending || balanceInsufficient || typesLoading;

  const onSubmit = useCallback(
    (values: LeaveRequestFormValues) => {
      setCapacityWarning(false);
      setServerInsufficientBalance(false);

      mutate(
        {
          leaveTypeId: values.leaveTypeId,
          startDate: values.startDate,
          endDate: values.endDate,
          halfDay: values.halfDay as HalfDay,
          reason: values.reason || undefined,
          overrideCapacity: capacityWarning,
        },
        {
          onSuccess: () => {
            addToast({
              message: "Leave request submitted successfully",
              variant: "success",
            });
            window.location.href = "/leave/my-requests";
          },
          onError: (err: unknown) => {
            const axiosError = err as {
              response?: { status?: number; data?: { code?: string; detail?: string } };
              message?: string;
            };
            const status = axiosError?.response?.status;
            const data = axiosError?.response?.data;

            if (status === 400 && data?.code === "InsufficientBalanceError") {
              setServerInsufficientBalance(true);
            } else if (status === 409 && data?.code === "ConflictException") {
              setCapacityWarning(true);
            } else {
              addToast({
                message:
                  data?.detail ?? axiosError?.message ?? "Failed to submit leave request",
                variant: "danger",
              });
            }
          },
        },
      );
    },
    [mutate, capacityWarning, addToast],
  );

  const {
    formState: { errors },
    handleSubmit,
    setValue,
  } = form;

  return (
    <form className="max-w-xl space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
      {/* Leave Type */}
      <div className="space-y-2">
        <Label htmlFor="leaveTypeId">Leave Type</Label>
        <Controller
          name="leaveTypeId"
          control={form.control}
          render={({ field }) => (
            <select
              id="leaveTypeId"
              aria-describedby={errors.leaveTypeId ? "leaveTypeId-error" : undefined}
              aria-invalid={Boolean(errors.leaveTypeId)}
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-background px-2 text-sm",
                errors.leaveTypeId && "border-destructive",
              )}
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                setServerInsufficientBalance(false);
              }}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>
          )}
        />
        {selectedBalance && (
          <p
            className={cn(
              "text-sm",
              (selectedBalance.closing < 1 || balanceInsufficient)
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {selectedBalance.closing < 1 || balanceInsufficient
              ? "Insufficient balance"
              : `${selectedBalance.closing} days available`}
          </p>
        )}
        {errors.leaveTypeId?.message && (
          <p id="leaveTypeId-error" className="text-sm text-destructive" role="alert">
            {errors.leaveTypeId.message}
          </p>
        )}
        {serverInsufficientBalance && (
          <p className="text-sm text-destructive" role="alert">
            Insufficient balance for selected dates
          </p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <Input
                id="startDate"
                type="date"
                aria-describedby={errors.startDate ? "startDate-error" : undefined}
                aria-invalid={Boolean(errors.startDate)}
                min={format(new Date(), "yyyy-MM-dd")}
                {...field}
              />
            )}
          />
          {errors.startDate?.message && (
            <p id="startDate-error" className="text-sm text-destructive" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => (
              <Input
                id="endDate"
                type="date"
                aria-describedby={errors.endDate ? "endDate-error" : undefined}
                aria-invalid={Boolean(errors.endDate)}
                min={startDate || format(new Date(), "yyyy-MM-dd")}
                {...field}
              />
            )}
          />
          {errors.endDate?.message && (
            <p id="endDate-error" className="text-sm text-destructive" role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {workingDays > 0 && (
        <p className="text-sm text-muted-foreground">
          {workingDays} working day{workingDays !== 1 ? "s" : ""} selected
        </p>
      )}

      {/* Half-day toggle */}
      {isSameDay && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Half Day</legend>
          <div className="flex rounded-lg border border-input p-0.5" role="radiogroup" aria-label="Half day">
            {(["full", "first_half", "second_half"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={halfDay === option}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  halfDay === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setValue("halfDay", option)}
              >
                {option === "full"
                  ? "Full day"
                  : option === "first_half"
                    ? "First half"
                    : "Second half"}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Controller
          name="reason"
          control={form.control}
          render={({ field }) => (
            <textarea
              id="reason"
              maxLength={500}
              rows={3}
              aria-describedby={errors.reason ? "reason-error" : undefined}
              aria-invalid={Boolean(errors.reason)}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex justify-between">
          {errors.reason?.message && (
            <p id="reason-error" className="text-sm text-destructive" role="alert">
              {errors.reason.message}
            </p>
          )}
          <p className="ml-auto text-xs text-muted-foreground">
            {reason?.length ?? 0} / 500
          </p>
        </div>
      </div>

      {/* Team capacity warning */}
      {capacityWarning && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">
              Your team has reached capacity for these dates. Submit anyway?
            </p>
          </div>
        </div>
      )}

      <Separator />

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button disabled={submitDisabled} type="submit">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
        {capacityWarning && (
          <Button
            disabled={isPending}
            type="button"
            variant="outline"
            onClick={() => {
              handleSubmit((values) => {
                mutate(
                  {
                    leaveTypeId: values.leaveTypeId,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    halfDay: values.halfDay as HalfDay,
                    reason: values.reason || undefined,
                    overrideCapacity: true,
                  },
                  {
                    onSuccess: () => {
                      addToast({
                        message: "Leave request submitted successfully",
                        variant: "success",
                      });
                      window.location.href = "/leave/my-requests";
                    },
                    onError: (err: unknown) => {
                      const axiosError = err as {
                        response?: { data?: { detail?: string } };
                        message?: string;
                      };
                      addToast({
                        message:
                          axiosError?.response?.data?.detail ??
                          axiosError?.message ??
                          "Failed to submit leave request",
                        variant: "danger",
                      });
                    },
                  },
                );
              })();
            }}
          >
            Submit anyway
          </Button>
        )}
      </div>
    </form>
  );
}
