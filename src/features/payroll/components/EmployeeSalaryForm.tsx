"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import {
  useApproveEmployeeSalary,
  useEmployeeSalary,
  useSalaryHistory,
} from "@/features/payroll/api/employee-salary";
import { SalaryRevisionDrawer } from "@/features/payroll/components/SalaryRevisionDrawer";

export function EmployeeSalaryForm({
  employeeId,
}: {
  employeeId: string;
}) {
  const { addToast } = useToastStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: salary,
    isLoading: salaryLoading,
    error: salaryError,
  } = useEmployeeSalary(employeeId);
  const { data: history = [], isLoading: historyLoading } =
    useSalaryHistory(employeeId);
  const approveMutation = useApproveEmployeeSalary();

  function handleApprove() {
    if (!salary) return;
    approveMutation.mutate(salary.id, {
      onSuccess: () => {
        addToast({
          message: "Salary approved",
          variant: "success",
        });
      },
      onError: () => {
        addToast({
          message: "Failed to approve salary",
          variant: "danger",
        });
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Current Salary Card */}
      {salaryLoading ? (
        <div className="rounded-lg border p-4">
          <Skeleton className="mb-2 h-5 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
      ) : salaryError || !salary ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">No salary assigned</p>
          <Button size="sm" type="button" onClick={() => setDrawerOpen(true)}>
            Assign Salary
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">{salary.structure.name}</p>
              <p className="mt-1 text-2xl font-semibold">
                ₹
                {(salary.ctc ?? 0).toLocaleString("en-IN")}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / year
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                ₹
                {Math.round((salary.ctc ?? 0) / 12).toLocaleString("en-IN")}{" "}
                / month
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Effective from{" "}
                {format(
                  new Date(salary.effectiveFrom + "T00:00:00"),
                  "d MMM yyyy",
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  salary.status === "approved" ? "default" : "outline"
                }
              >
                {salary.status === "approved" ? "Approved" : "Draft"}
              </Badge>
              {salary.status === "draft" && (
                <Button
                  size="sm"
                  type="button"
                  disabled={approveMutation.isPending}
                  onClick={handleApprove}
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Approve"
                  )}
                </Button>
              )}
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setDrawerOpen(true)}
              >
                Revise
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Salary History Timeline */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Revision History</h3>
          <div className="space-y-3">
            {history.map((entry: Record<string, unknown>, idx: number) => (
              <div key={String(entry.id ?? idx)} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-2 rounded-full bg-muted-foreground/30" />
                  {idx < history.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium">
                    {format(
                      new Date(
                        String(entry.effectiveFrom ?? entry.createdAt ?? "") +
                          "T00:00:00",
                      ),
                      "d MMM yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {String(entry.structure?.name ?? "")} — ₹
                    {Number(entry.ctc ?? 0).toLocaleString("en-IN")}
                    /year
                  </p>
                  <Badge
                    variant={
                      entry.status === "approved" ? "default" : "outline"
                    }
                  >
                    {entry.status === "approved" ? "Approved" : "Draft"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} {/* Revision History Loading */}{" "}
      {historyLoading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      {/* Drawer */}{" "}
      <SalaryRevisionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employeeId={employeeId}
      />
    </div>
  );
}
