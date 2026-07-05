// src/features/mss/components/LeaveApprovalsTab.tsx
// Sprint 6 — Leave approvals tab with DataTable

"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { useTeamLeaveRequests } from "../hooks/useTeamLeaveRequests";
import { useMssStore } from "../store/mss.store";
import { ApproveRejectModal } from "./ApproveRejectModal";
import { BulkActionBar } from "./BulkActionBar";
import type { TeamLeaveRequest, TeamLeaveFilters } from "@/types/mss.types";

export function LeaveApprovalsTab() {
  const { selectedIds, toggleSelect, selectAll, clearSelection } = useMssStore();
  const [filters, setFilters] = useState<TeamLeaveFilters>({
    page: 1,
    limit: 20,
    status: "PENDING",
  });
  const [modalState, setModalState] = useState<{
    id: string | string[];
    action: "approve" | "reject";
  } | null>(null);

  const { data, isLoading } = useTeamLeaveRequests(filters);

  const requests = data?.data ?? [];
  const allSelected =
    requests.length > 0 && requests.every((r) => selectedIds.includes(r.id));

  function handleBulkApprove() {
    if (selectedIds.length === 0) return;
    setModalState({ id: selectedIds, action: "approve" });
  }

  function handleBulkReject() {
    if (selectedIds.length === 0) return;
    setModalState({ id: selectedIds, action: "reject" });
  }

  function handleModalClose() {
    setModalState(null);
    clearSelection();
  }

  return (
    <div data-testid="leave-approvals-tab">
      {/* ─── Filters ───────────────────────────────── */}
      <div className="mb-3 flex flex-wrap gap-2">
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          className="rounded border px-2 py-1 text-sm"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* ─── Table ─────────────────────────────────── */}
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-14 w-full" />
        ))
      ) : requests.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No leave requests found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="w-10 px-3 py-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                      checked ? selectAll(requests.map((r) => r.id)) : clearSelection()
                    }
                    aria-label="Select all"
                    data-testid="select-all-checkbox"
                  />
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Employee
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Period
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Days
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Applied
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selectedIds.includes(req.id)}
                      onCheckedChange={() => toggleSelect(req.id)}
                      aria-label={`Select ${req.employeeName}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">{req.employeeName}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-xs">
                      {req.leaveType}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {format(new Date(req.startDate), "dd MMM")} –{" "}
                    {format(new Date(req.endDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{req.days}d</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDistanceToNow(new Date(req.appliedAt), { addSuffix: true })}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={req.status === "PENDING" ? "default" : "outline"}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {req.status === "PENDING" && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600"
                          onClick={() => setModalState({ id: req.id, action: "approve" })}
                          aria-label={`Approve ${req.employeeName}'s leave`}
                          data-testid="approve-btn"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => setModalState({ id: req.id, action: "reject" })}
                          aria-label={`Reject ${req.employeeName}'s leave`}
                          data-testid="reject-btn"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Bulk Action Bar ────────────────────────── */}
      <BulkActionBar
        selectedIds={selectedIds}
        onApproveAll={handleBulkApprove}
        onRejectAll={handleBulkReject}
      />

      {/* ─── Modal ──────────────────────────────────── */}
      {modalState && (
        <ApproveRejectModal
          requestId={modalState.id}
          action={modalState.action}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
