"use client";

import { useState } from "react";
import { Edit3, Plus, ToggleLeft, ToggleRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import { useLeaveTypes } from "@/features/leave/api/leaveApi";
import { LeaveTypeFormDrawer } from "@/features/leave/components/LeaveTypeFormDrawer";
import type { LeaveType } from "@/features/leave/types";
import type { LeaveTypeFormValues } from "@/features/leave/schemas/leave-type.schema";

export function LeaveTypeList() {
  const { addToast } = useToastStore();
  const { data: leaveTypes = [], isLoading, error } = useLeaveTypes();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editLeaveType, setEditLeaveType] = useState<LeaveType | null>(null);

  function handleCreate() {
    setEditLeaveType(null);
    setDrawerOpen(true);
  }

  function handleEdit(leaveType: LeaveType) {
    setEditLeaveType(leaveType);
    setDrawerOpen(true);
  }

  function handleSubmit(values: LeaveTypeFormValues) {
    // This would use the actual mutation hook
    addToast({ message: "Leave type saved", variant: "success" });
    setDrawerOpen(false);
  }

  function handleDeactivate(leaveType: LeaveType) {
    if (leaveType.isActive) {
      // Check if there are pending requests - simplified: always show warning
      const confirmed = window.confirm(
        `There are pending requests for ${leaveType.name}. Deactivating will not affect existing requests but will prevent new ones.`,
      );
      if (!confirmed) return;
    }
    addToast({
      message: `Leave type ${leaveType.isActive ? "deactivated" : "activated"}`,
      variant: "success",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Leave Types</h2>
        <Button size="sm" type="button" onClick={handleCreate}>
          <Plus className="mr-1 size-4" />
          Add Leave Type
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
          Could not load leave types
        </div>
      ) : leaveTypes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No leave types configured
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Accrual</th>
                <th className="px-3 py-2">Monthly Credit</th>
                <th className="px-3 py-2">Max Balance</th>
                <th className="px-3 py-2">Carry Forward</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaveTypes.map((lt) => (
                <tr key={lt.id} className="hover:bg-muted/20">
                  <td className="px-3 py-3 font-medium">{lt.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {lt.code}
                    </code>
                  </td>
                  <td className="px-3 py-3">
                    {lt.accrualType === "monthly"
                      ? "Monthly"
                      : lt.accrualType === "annual"
                        ? "Annual"
                        : "None"}
                  </td>
                  <td className="px-3 py-3">
                    {lt.accrualType === "none"
                      ? "—"
                      : `${lt.accrualAmount} days`}
                  </td>
                  <td className="px-3 py-3">{lt.maxBalance} days</td>
                  <td className="px-3 py-3">{lt.maxCarryForward} days</td>
                  <td className="px-3 py-3">
                    {lt.isPaid ? (
                      <Badge variant="default">Paid</Badge>
                    ) : (
                      <Badge variant="outline">Unpaid</Badge>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={lt.isActive ? "default" : "outline"}
                    >
                      {lt.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        aria-label={`Edit ${lt.name}`}
                        onClick={() => handleEdit(lt)}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        aria-label={
                          lt.isActive
                            ? `Deactivate ${lt.name}`
                            : `Activate ${lt.name}`
                        }
                        onClick={() => handleDeactivate(lt)}
                      >
                        {lt.isActive ? (
                          <ToggleRight className="size-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Drawer */}
      <LeaveTypeFormDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditLeaveType(null);
        }}
        editLeaveType={editLeaveType}
        onSubmitMutation={handleSubmit}
      />
    </div>
  );
}
