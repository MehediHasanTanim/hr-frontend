"use client";

import { format } from "date-fns";
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHolidaysQuery } from "@/features/holiday/api/holidayApi";
import type { Holiday } from "@/features/leave/types";

function getTypeBadgeVariant(type: string) {
  switch (type) {
    case "public":
      return "destructive" as const;
    case "optional":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function HolidayList({
  calendarId,
  calendarName,
  calendarYear,
  isDefault,
  onAdd,
  onEdit,
}: {
  calendarId: string;
  calendarName: string;
  calendarYear: number;
  isDefault: boolean;
  onAdd: () => void;
  onEdit: (holiday: Holiday) => void;
}) {
  const { data: holidays = [], isLoading, error } = useHolidaysQuery(calendarId);

  const sorted = [...holidays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {calendarName}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({calendarYear})
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${sorted.length} holiday${sorted.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <Button size="sm" type="button" onClick={onAdd}>
          <Plus className="mr-1 size-4" />
          Add Holiday
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load holidays
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="mb-3 text-4xl text-muted-foreground/40">📅</span>
          <p className="text-sm font-medium text-muted-foreground">
            No holidays added
          </p>
          <Button className="mt-2" size="sm" type="button" variant="outline" onClick={onAdd}>
            Add your first holiday →
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-muted/20">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {format(
                      new Date(holiday.date + "T00:00:00"),
                      "EEE, d MMM yyyy",
                    )}
                  </td>
                  <td className="px-3 py-3 font-medium">{holiday.name}</td>
                  <td className="px-3 py-3">
                    <Badge variant={getTypeBadgeVariant(holiday.type)}>
                      {holiday.type === "public"
                        ? "Public"
                        : holiday.type === "optional"
                          ? "Optional"
                          : "Restricted"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        aria-label={`Edit ${holiday.name}`}
                        onClick={() => onEdit(holiday)}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      {/* Delete is handled within HolidayFormModal via the edit dialog */}
                    </div>
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
