"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Loader2, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import {
  useCreatePayrollCycle,
  usePayrollCycles,
} from "@/features/payroll/api/payroll-cycles";
import { CycleStatusBadge } from "@/features/payroll/components/CycleStatusBadge";
import type { PayrollCycle } from "@/features/payroll/types";

export function PayrollCycleList() {
  const { addToast } = useToastStore();
  const [page] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  const { data, isLoading, error } = usePayrollCycles(page);
  const createMutation = useCreatePayrollCycle();

  const cycles = data?.data ?? [];

  function cycleStatus(entry: PayrollCycle) {
    return entry.status;
  }

  function handleCreate() {
    createMutation.mutate(
      { month: newMonth, year: newYear },
      {
        onSuccess: () => {
          addToast({ message: "Cycle created", variant: "success" });
          setCreateModal(false);
        },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { status?: number; data?: { code?: string } } };
          if (axiosErr?.response?.status === 409) {
            addToast({
              message: "A cycle for this period already exists",
              variant: "warning",
            });
          } else {
            addToast({ message: "Failed to create cycle", variant: "danger" });
          }
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payroll Cycles</h2>
        <Button size="sm" type="button" onClick={() => setCreateModal(true)}>
          <Plus className="mr-1 size-4" />
          Create Cycle
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load payroll cycles
        </div>
      ) : cycles.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No cycles found. Create one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Employees</th>
                <th className="px-3 py-2">Gross</th>
                <th className="px-3 py-2">Net</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-muted/20">
                  <td className="px-3 py-3 font-medium">
                    {format(new Date(cycle.year, cycle.month - 1), "MMMM yyyy")}
                  </td>
                  <td className="px-3 py-3">
                    <CycleStatusBadge status={cycleStatus(cycle)} />
                  </td>
                  <td className="px-3 py-3">{cycle.employeeCount}</td>
                  <td className="px-3 py-3">
                    {cycle.totalGross.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-3 py-3">
                    {cycle.totalNet.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {cycle.runAt
                      ? format(new Date(cycle.runAt), "d MMM")
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/payroll/cycles/${cycle.id}`}>
                        <Button size="icon-sm" type="button" variant="ghost" aria-label="View">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Cycle Modal */}
      <Dialog open={createModal} onOpenChange={(o) => { if (!o) setCreateModal(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payroll Cycle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cyc-month">Month</Label>
              <select
                id="cyc-month"
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                value={newMonth}
                onChange={(e) => setNewMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {format(new Date(2024, m - 1), "MMMM")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cyc-year">Year</Label>
              <select
                id="cyc-year"
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
              >
                {[newYear - 1, newYear, newYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={createMutation.isPending} onClick={handleCreate}>
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
