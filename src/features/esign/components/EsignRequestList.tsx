"use client";

import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EsignStatusBadge } from "./EsignStatusBadge";
import type { EsignRequest, EsignStatus } from "../types/esign.types";

interface EsignRequestListProps {
  requests: EsignRequest[];
  isLoading?: boolean;
  statusFilter: EsignStatus | "all";
  onStatusFilterChange: (status: EsignStatus | "all") => void;
  onCreateRequest: () => void;
}

const STATUS_FILTERS: { label: string; value: EsignStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Signed", value: "SIGNED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Expired", value: "EXPIRED" },
];

export function EsignRequestList({
  requests,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  onCreateRequest,
}: EsignRequestListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">eSign Requests</h2>
        <Button size="sm" onClick={onCreateRequest}>
          <Plus className="size-4 mr-1" />
          Create Request
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s.value}
            size="xs"
            variant={statusFilter === s.value ? "default" : "outline"}
            onClick={() => onStatusFilterChange(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No eSign requests found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pl-4 font-medium">Document</th>
                <th className="pb-2 font-medium">Signer</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Expires</th>
                <th className="pb-2 font-medium">Signed / Declined</th>
                <th className="pb-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-b-0 hover:bg-muted/50"
                >
                  <td className="py-3 pl-4 font-medium">
                    {r.documentId.slice(0, 8)}...
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {r.signerEmployeeId.slice(0, 8)}...
                  </td>
                  <td className="py-3">
                    <EsignStatusBadge status={r.status} />
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDistanceToNow(new Date(r.expiresAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {r.signedAt &&
                      format(new Date(r.signedAt), "dd MMM yyyy")}
                    {r.declinedAt &&
                      format(new Date(r.declinedAt), "dd MMM yyyy")}
                    {!r.signedAt && !r.declinedAt && "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/esign/${r.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
