"use client";

import { useState, useCallback } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast.store";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { exportAuditLogs } from "../api/audit.api";
import { AuditLogFilters as AuditLogFiltersComponent } from "./AuditLogFilters";
import { AuditLogTable } from "./AuditLogTable";
import type { AuditLogFilters } from "../types/audit.types";

interface AuditLogViewerProps {
  initialData: {
    data: import("../types/audit.types").AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
  };
}

export function AuditLogViewer({ initialData }: AuditLogViewerProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [exportDisabled, setExportDisabled] = useState(false);

  const { data, isLoading } = useAuditLogs(filters);

  const handleFiltersChange = useCallback(
    (newFilters: AuditLogFilters) => {
      setFilters(newFilters);
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleExport = async () => {
    if (exportDisabled) return;
    setExportDisabled(true);

    try {
      const { action, actorId, resourceType, dateFrom, dateTo, page: _p, limit: _l, ...rest } = filters;
      void _p; void _l;
      await exportAuditLogs({
        ...rest,
        action: filters.action,
        actorId: filters.actorId,
        resourceType: filters.resourceType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      addToast({
        message: "Export queued. You'll be notified when ready.",
        variant: "success",
        duration: 3000,
      });
    } catch {
      addToast({
        message: "Failed to queue export. Please try again.",
        variant: "danger",
        duration: 3000,
      });
    } finally {
      setTimeout(() => setExportDisabled(false), 5000);
    }
  };

  const displayData = data ?? initialData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit Logs</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={exportDisabled}
        >
          <Download className="size-4 mr-1" />
          Export CSV
        </Button>
      </div>

      <AuditLogFiltersComponent
        filters={filters}
        onChange={handleFiltersChange}
      />

      <AuditLogTable
        data={displayData.data}
        isLoading={isLoading}
        total={displayData.total}
        page={filters.page ?? 1}
        limit={filters.limit ?? 20}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
