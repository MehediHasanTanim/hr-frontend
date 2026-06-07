"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToastStore } from "@/stores/toast.store";
import {
  useApprovePayrollCycle,
  useDisbursePayrollCycle,
  usePayrollCycle,
  useReversePayrollCycle,
} from "@/features/payroll/api/payroll-cycles";
import { CycleStatusBadge } from "@/features/payroll/components/CycleStatusBadge";
import type { PayrollCycle } from "@/features/payroll/types";

function fmt(amount: number) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function CycleApprovalPanel({
  cycle,
  onStatusChange,
}: {
  cycle: PayrollCycle;
  onStatusChange?: () => void;
}) {
  const { addToast } = useToastStore();
  const [approveModal, setApproveModal] = useState(false);
  const [reverseModal, setReverseModal] = useState(false);
  const [disburseModal, setDisburseModal] = useState(false);
  const [reversalReason, setReversalReason] = useState("");
  const [bankFormat, setBankFormat] = useState<"neft" | "ach">("neft");
  const [showBankPopover, setShowBankPopover] = useState(false);

  const approveMutation = useApprovePayrollCycle(cycle.id);
  const reverseMutation = useReversePayrollCycle(cycle.id);
  const disburseMutation = useDisbursePayrollCycle(cycle.id);

  function handleApprove() {
    approveMutation.mutate(undefined, {
      onSuccess: () => {
        addToast({ message: "Payroll approved", variant: "success" });
        setApproveModal(false);
        onStatusChange?.();
      },
      onError: () => {
        addToast({ message: "Failed to approve payroll", variant: "danger" });
      },
    });
  }

  function handleReverse() {
    if (reversalReason.trim().length < 20) return;
    reverseMutation.mutate(
      { reversalReason: reversalReason.trim() },
      {
        onSuccess: () => {
          addToast({
            message: "Payroll reversed. A new cycle can now be created.",
            variant: "success",
          });
          setReverseModal(false);
          setReversalReason("");
          onStatusChange?.();
        },
        onError: () => {
          addToast({ message: "Failed to reverse payroll", variant: "danger" });
        },
      },
    );
  }

  function handleDisburse() {
    disburseMutation.mutate(undefined, {
      onSuccess: () => {
        addToast({
          message: "Payroll disbursed. Payslips are being generated.",
          variant: "success",
        });
        setDisburseModal(false);
        onStatusChange?.();
      },
      onError: () => {
        addToast({ message: "Failed to disburse payroll", variant: "danger" });
      },
    );
  }

  function handleExportBankFile() {
    window.open(
      `/api/v1/payroll/cycles/${cycle.id}/bank-file?format=${bankFormat}`,
      "_blank",
    );
    setShowBankPopover(false);
  }

  // ─── Computed panel ──────────────────────────────────
  if (cycle.status === "computed") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-blue-800">
              Payroll ready for review
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Computed{" "}
              {cycle.runAt
                ? new Date(cycle.runAt).toLocaleDateString()
                : ""}{" "}
              · {cycle.employeeCount} employees
            </p>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Gross
                </p>
                <p className="text-lg font-semibold">
                  {fmt(cycle.totalGross)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Deductions
                </p>
                <p className="text-lg font-semibold">
                  {fmt(cycle.totalDeductions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Net Payable
                </p>
                <p className="text-lg font-semibold">
                  {fmt(cycle.totalNet)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setReverseModal(true)}
              >
                Reject
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => setApproveModal(true)}
              >
                <CheckCircle className="mr-1 size-4" />
                Approve
              </Button>
            </div>
          </div>
        </div>

        {/* Approve Modal */}
        <Dialog open={approveModal} onOpenChange={(o) => { if (!o) setApproveModal(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Payroll</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will lock all entries. Payslips will be generated after
              disbursement.
            </p>
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <p>{cycle.employeeCount} employees</p>
              <p>Net payable: {fmt(cycle.totalNet)}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApproveModal(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={approveMutation.isPending} onClick={handleApprove}>
                {approveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Approved panel ──────────────────────────────────
  if (cycle.status === "approved") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 text-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 size-5 text-green-600" />
          <div className="flex-1">
            <p className="font-medium text-green-800">
              Payroll approved
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ready to disburse to {cycle.employeeCount} employees · Net
              payable: {fmt(cycle.totalNet)}
            </p>
            <div className="mt-3 flex gap-2">
              <div className="relative">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setShowBankPopover(!showBankPopover)}
                >
                  Export Bank File
                </Button>
                {showBankPopover && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border bg-popover p-2 shadow-md">
                    <div className="space-y-2">
                      <Label className="text-xs">Format</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            bankFormat === "neft"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                          onClick={() => setBankFormat("neft")}
                        >
                          NEFT
                        </button>
                        <button
                          type="button"
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            bankFormat === "ach"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                          onClick={() => setBankFormat("ach")}
                        >
                          ACH
                        </button>
                      </div>
                      <Button
                        size="xs"
                        type="button"
                        className="w-full"
                        onClick={handleExportBankFile}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                type="button"
                onClick={() => setDisburseModal(true)}
              >
                <CheckCircle className="mr-1 size-4" />
                Disburse &amp; Generate Payslips
              </Button>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setReverseModal(true)}
              >
                Reverse
              </Button>
            </div>
          </div>
        </div>

        {/* Disburse Modal */}
        <Dialog open={disburseModal} onOpenChange={(o) => { if (!o) setDisburseModal(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disburse Payroll</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Payslips will be generated and sent to employees. This action
              cannot be undone.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDisburseModal(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={disburseMutation.isPending} onClick={handleDisburse}>
                {disburseMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Disburse"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Disbursed banner ────────────────────────────────
  if (cycle.status === "disbursed") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 text-sm">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <p className="flex-1 font-medium text-green-800">
            Payslips are being generated in the background. Employees will
            receive their payslips shortly.
          </p>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setReverseModal(true)}
          >
            Reverse
          </Button>
        </div>
      </div>
    );
  }

  // ─── Reverse Modal (shared) ──────────────────────────
  return (
    <>
      {reverseModal && (
        <Dialog open={reverseModal} onOpenChange={(o) => { if (!o) { setReverseModal(false); setReversalReason(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {cycle.status === "approved" || cycle.status === "disbursed"
                  ? "Reverse Payroll"
                  : "Reject Payroll"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="reversal-reason">
                Reason for reversal (required, min 20 characters)
              </Label>
              <textarea
                id="reversal-reason"
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {reversalReason.length} / min 20
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReverseModal(false);
                  setReversalReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={reversalReason.trim().length < 20 || reverseMutation.isPending}
                onClick={handleReverse}
              >
                {reverseMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirm Reversal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
