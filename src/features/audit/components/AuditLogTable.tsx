"use client";

import { format } from "date-fns";
import { Copy, Eye } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditDiffDrawer } from "./AuditDiffDrawer";
import type { AuditLogEntry } from "../types/audit.types";

interface AuditLogTableProps {
  data: AuditLogEntry[] | undefined;
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function actionColorClass(action: string): string {
  if (/DELETE_|_DECLINED|_EXPIRED|_REJECTED/.test(action)) {
    return "text-red-600";
  }
  if (
    /CREATE|UPLOADED|PUBLISHED|SIGNED|APPROVED|DISBURSED/.test(action)
  ) {
    return "text-amber-600";
  }
  return "text-gray-600";
}

export function AuditLogTable({
  data,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
}: AuditLogTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(
    null,
  );
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No audit log entries match your filters.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 pl-4 font-medium">Timestamp</th>
              <th className="pb-2 font-medium">Actor</th>
              <th className="pb-2 font-medium">Action</th>
              <th className="pb-2 font-medium">Resource</th>
              <th className="pb-2 font-medium">IP</th>
              <th className="pb-2 pr-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr
                key={entry.id}
                className="border-b last:border-b-0 hover:bg-muted/50"
              >
                <td className="py-3 pl-4 text-xs whitespace-nowrap">
                  {format(
                    new Date(entry.createdAt),
                    "dd MMM yyyy HH:mm:ss",
                  )}
                </td>
                <td className="py-3 text-xs">
                  {entry.actorName || `${entry.actorId.slice(0, 8)}...`}
                </td>
                <td className="py-3">
                  <code
                    className={`text-xs ${actionColorClass(entry.action)}`}
                  >
                    {entry.action}
                  </code>
                </td>
                <td className="py-3 text-xs text-muted-foreground">
                  {entry.resourceType
                    ? `${entry.resourceType}:${entry.resourceId?.slice(0, 8) ?? "—"}`
                    : "—"}
                </td>
                <td className="py-3 text-xs text-muted-foreground">
                  {entry.ipAddress ?? "—"}
                </td>
                <td className="py-3 pr-4">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <Eye className="size-3.5 mr-1" />
                    View diff
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 text-sm">
        <p className="text-muted-foreground">
          Page {page} of {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Button
            size="xs"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <AuditDiffDrawer
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}
