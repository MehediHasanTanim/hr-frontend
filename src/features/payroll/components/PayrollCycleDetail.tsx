"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import {
  usePayrollCycle,
  useRunPayrollCycle,
} from "@/features/payroll/api/payroll-cycles";
import { CycleApprovalPanel } from "@/features/payroll/components/CycleApprovalPanel";
import { CycleStatusBadge } from "@/features/payroll/components/CycleStatusBadge";
import { PayrollEntryTable } from "@/features/payroll/components/PayrollEntryTable";

function fmt(amount: number) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function PayrollCycleDetail({ cycleId }: { cycleId: string }) {
  const { addToast } = useToastStore();
  const [runModal, setRunModal] = useState(false);

  const { data: cycle, isLoading, error } = usePayrollCycle(cycleId);
  const runMutation = useRunPayrollCycle(cycleId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load cycle
      </div>
    );
  }

  function handleRun() {
    runMutation.mutate(undefined, {
      onSuccess: () => {
        addToast({
          message: "Payroll computation started",
          variant: "success",
        });
        setRunModal(false);
      },
      onError: () => {
        addToast({
          message: "Failed to start payroll run",
          variant: "danger",
        });
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="flex items-start justify-between rounded-lg border p-4">
        <div>
          <h2 className="text-xl font-semibold">
            {format(new Date(cycle.year, cycle.month - 1), "MMMM yyyy")}{" "}
            Payroll
          </h2>
          <div className="mt-2">
            <CycleStatusBadge status={cycle.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {cycle.runAt
              ? `Last updated ${format(new Date(cycle.runAt), "d MMM yyyy HH:mm")}`
              : "Not yet run"}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Run button */}
          {cycle.status === "draft" && (
            <Button type="button" onClick={() => setRunModal(true)}>
              <Play className="mr-1 size-4" />
              Run Payroll
            </Button>
          )}

          {/* Processing state */}
          {cycle.status === "processing" && (
            <Button type="button" disabled>
              <Loader2 className="mr-1 size-4 animate-spin" />
              Processing...
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator for processing */}
      {cycle.status === "processing" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-amber-600" />
            <span className="font-medium text-amber-800">
              Computing payroll...
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-500" />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {cycle.status !== "draft" && cycle.status !== "processing" && (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Total Gross"
            value={fmt(cycle.totalGross)}
          />
          <MetricCard
            label="Total Net"
            value={fmt(cycle.totalNet)}
          />
          <MetricCard label="Employees" value={String(cycle.employeeCount)} />
          <MetricCard label="Status" value={<CycleStatusBadge status={cycle.status} />} />
        </div>
      )}

      {/* Approval Panel */}
      {(cycle.status === "computed" ||
        cycle.status === "approved" ||
        cycle.status === "disbursed") && (
        <CycleApprovalPanel cycle={cycle} />
      )}

      {/* Entries Table */}
      {(cycle.status === "computed" ||
        cycle.status === "approved" ||
        cycle.status === "disbursed" ||
        cycle.status === "processing") && (
        <div>
          <h3 className="mb-3 text-sm font-medium">Payroll Entries</h3>
          <PayrollEntryTable cycleId={cycleId} />
        </div>
      )}

      {/* Run Modal */}
      <Dialog open={runModal} onOpenChange={(o) => { if (!o) setRunModal(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Payroll</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will compute salaries for all active employees. The process
            runs in the background and may take a few minutes.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRunModal(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={runMutation.isPending} onClick={handleRun}>
              {runMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Run Payroll"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
