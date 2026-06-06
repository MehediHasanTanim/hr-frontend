"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Check, Loader2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import {
  useApproveLeaveRequest,
  useLeaveRequests,
  useRejectLeaveRequest,
} from "@/features/leave/api/leaveApi";
import type { LeaveRequest, LeaveRequestListQuery } from "@/features/leave/types";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export function LeaveApprovalQueue() {
  const { addToast } = useToastStore();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const pageSize = 20;

  const query: LeaveRequestListQuery = {
    status: statusFilter || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useLeaveRequests(query);
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Client-side search filter
  const filteredRequests =
    searchQuery.trim()
      ? requests.filter(
          (r) =>
            r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : requests;

  // Date range filter (client-side)
  const dateFiltered = filteredRequests.filter((r) => {
    if (fromDate && r.startDate < fromDate) return false;
    if (toDate && r.startDate > toDate) return false;
    return true;
  });

  function handleApprove(id: string) {
    approveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          addToast({ message: "Request approved", variant: "success" });
        },
        onError: () => {
          addToast({
            message: "Failed to approve request",
            variant: "danger",
          });
        },
      },
    );
  }

  function handleReject(id: string) {
    if (rejectReason.trim().length < 10) {
      setRejectError("Rejection reason must be at least 10 characters");
      return;
    }
    setRejectError("");
    rejectMutation.mutate(
      { id, rejectionReason: rejectReason.trim() },
      {
        onSuccess: () => {
          addToast({ message: "Request rejected", variant: "success" });
          setRejectingId(null);
          setRejectReason("");
        },
        onError: () => {
          addToast({
            message: "Failed to reject request",
            variant: "danger",
          });
        },
      },
    );
  }

  function cancelReject() {
    setRejectingId(null);
    setRejectReason("");
    setRejectError("");
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load leave requests. Please try again.
      </div>
    );
  }

  if (!isLoading && filteredRequests.length === 0 && statusFilter === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Check className="mb-3 size-12 text-muted-foreground/50" />
        <h3 className="text-lg font-medium">All caught up</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No pending leave requests
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg border p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search employees"
            className="h-7 w-48 pl-7 text-xs"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date range */}
        <Input
          aria-label="From date"
          className="h-7 w-36 text-xs"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <Input
          aria-label="To date"
          className="h-7 w-36 text-xs"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Employee</th>
              <th className="px-3 py-2">Leave Type</th>
              <th className="px-3 py-2">Dates</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Applied On</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-3 py-3" colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : dateFiltered.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                  No requests found
                </td>
              </tr>
            ) : (
              dateFiltered.map((request: LeaveRequest) => {
                const isRejecting = rejectingId === request.id;
                const isApproving =
                  approveMutation.isPending &&
                  approveMutation.variables?.id === request.id;
                const isRejectingApi =
                  rejectMutation.isPending &&
                  rejectMutation.variables?.id === request.id;

                return (
                  <tr key={request.id} className="hover:bg-muted/20">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                          {request.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium">{request.employeeName}</p>
                          {request.departmentName && (
                            <p className="text-xs text-muted-foreground">
                              {request.departmentName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{request.leaveTypeName}</Badge>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {format(new Date(request.startDate + "T00:00:00"), "d MMM")}
                      {" – "}
                      {format(new Date(request.endDate + "T00:00:00"), "d MMM yyyy")}
                    </td>
                    <td className="px-3 py-3">
                      {request.totalDays === 0.5
                        ? "0.5 days"
                        : `${request.totalDays} days`}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {isRejecting ? (
                        <div className="flex flex-col gap-2">
                          <div className="space-y-1">
                            <Label htmlFor={`reject-reason-${request.id}`}>
                              Rejection reason
                            </Label>
                            <textarea
                              id={`reject-reason-${request.id}`}
                              rows={2}
                              maxLength={500}
                              className={cn(
                                "w-full rounded-lg border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                rejectError && "border-destructive",
                              )}
                              placeholder="Required (min 10 chars)"
                              value={rejectReason}
                              onChange={(e) => {
                                setRejectReason(e.target.value);
                                setRejectError("");
                              }}
                            />
                            {rejectError && (
                              <p className="text-xs text-destructive">
                                {rejectError}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="xs"
                              type="button"
                              variant="ghost"
                              onClick={cancelReject}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="xs"
                              type="button"
                              variant="destructive"
                              disabled={isRejectingApi}
                              onClick={() => handleReject(request.id)}
                            >
                              {isRejectingApi ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                "Confirm Reject"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                            disabled={isApproving}
                            onClick={() => handleApprove(request.id)}
                            aria-label={`Approve ${request.employeeName}`}
                          >
                            {isApproving ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Check className="size-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                            disabled={statusFilter !== "pending"}
                            onClick={() => setRejectingId(request.id)}
                            aria-label={`Reject ${request.employeeName}`}
                          >
                            <X className="size-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {total} requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={page <= 1}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    size="xs"
                    type="button"
                    variant={pageNum === page ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              disabled={page >= totalPages}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
