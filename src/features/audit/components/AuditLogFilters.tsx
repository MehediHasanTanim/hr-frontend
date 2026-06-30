"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuditLogFilters } from "../types/audit.types";

const KNOWN_ACTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "DOCUMENT_UPLOADED",
  "POLICY_PUBLISHED",
  "POLICY_ACKNOWLEDGED",
  "ESIGN_REQUEST_CREATED",
  "ESIGN_DOCUMENT_SIGNED",
  "ESIGN_REQUEST_DECLINED",
];

const RESOURCE_TYPES = [
  "employee_document",
  "policy",
  "esign_request",
  "employee",
  "leave_request",
  "payslip",
];

interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  onChange: (filters: AuditLogFilters) => void;
}

type FilterFormValues = {
  actorId: string;
  action: string;
  resourceType: string;
  dateFrom: string;
  dateTo: string;
};

export function AuditLogFilters({
  filters,
  onChange,
}: AuditLogFiltersProps) {
  const { register, watch, reset, setValue } = useForm<FilterFormValues>({
    defaultValues: {
      actorId: filters.actorId ?? "",
      action: filters.action ?? "",
      resourceType: filters.resourceType ?? "",
      dateFrom: filters.dateFrom ?? "",
      dateTo: filters.dateTo ?? "",
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const watchedValues = watch();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const newFilters: AuditLogFilters = {};

      if (watchedValues.actorId) newFilters.actorId = watchedValues.actorId;
      if (watchedValues.action) newFilters.action = watchedValues.action;
      if (watchedValues.resourceType)
        newFilters.resourceType = watchedValues.resourceType;

      // Validate date range
      let dateFrom = watchedValues.dateFrom || undefined;
      let dateTo = watchedValues.dateTo || undefined;

      if (dateFrom && dateTo) {
        if (new Date(dateTo) < new Date(dateFrom)) {
          return; // invalid range, don't update
        }
      }

      if (dateFrom) newFilters.dateFrom = dateFrom;
      if (dateTo) newFilters.dateTo = dateTo;

      newFilters.page = 1;
      newFilters.limit = 20;

      onChange(newFilters);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watchedValues, onChange]);

  const handleClear = () => {
    reset({
      actorId: "",
      action: "",
      resourceType: "",
      dateFrom: "",
      dateTo: "",
    });
    onChange({ page: 1, limit: 20 });
  };

  const hasFilters =
    filters.actorId ||
    filters.action ||
    filters.resourceType ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <Label htmlFor="actorId" className="text-xs">
            Actor (UUID)
          </Label>
          <Input
            id="actorId"
            {...register("actorId")}
            placeholder="UUID..."
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label htmlFor="action" className="text-xs">
            Action
          </Label>
          <select
            id="action"
            {...register("action")}
            className="block w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            {KNOWN_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
            <option value="__other__">Other (type manually)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="resourceType" className="text-xs">
            Resource Type
          </Label>
          <select
            id="resourceType"
            {...register("resourceType")}
            className="block w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            {RESOURCE_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="dateFrom" className="text-xs">
            Date From
          </Label>
          <Input
            id="dateFrom"
            type="date"
            {...register("dateFrom")}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label htmlFor="dateTo" className="text-xs">
            Date To
          </Label>
          <Input
            id="dateTo"
            type="date"
            {...register("dateTo")}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {hasFilters && (
        <Button
          size="xs"
          variant="ghost"
          onClick={handleClear}
          className="text-xs"
        >
          <X className="size-3 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
