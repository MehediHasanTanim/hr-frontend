// src/features/skills/matrix/components/SkillsMatrixHeatmap.tsx
// Sprint 9 F4 — Skills matrix heatmap grid

"use client";

import React, { useState } from "react";
import { useSkillsMatrixQuery } from "../api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillsMatrixFilters, SkillsMatrixCell } from "@/types/skills";

function getCellColor(level: number | null): string {
  if (level === null) return "bg-gray-100 dark:bg-gray-800";
  if (level >= 5) return "bg-green-500";
  if (level >= 4) return "bg-green-300";
  if (level >= 3) return "bg-amber-300";
  if (level >= 2) return "bg-orange-300";
  return "bg-red-300";
}

function CellTooltip({ cell }: { cell: SkillsMatrixCell }) {
  return (
    <div className="text-xs">
      <p className="font-semibold">{cell.employeeName}</p>
      <p>
        {cell.skillName}: Level {cell.level ?? "—"}
      </p>
      <p className="text-muted-foreground">
        {cell.isValidated ? "Manager-validated" : "Self-assessed"}
      </p>
      {cell.hasGap && (
        <p className="text-red-600">Skill gap detected</p>
      )}
    </div>
  );
}

export function SkillsMatrixHeatmap() {
  const [filters, setFilters] = useState<SkillsMatrixFilters>({});
  const { data, isLoading, isError, refetch } = useSkillsMatrixQuery(filters);

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="skills-matrix-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">Failed to load skills matrix.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const { employees, skills, cells } = data ?? { employees: [], skills: [], cells: [] };

  if (employees.length === 0 || skills.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center" data-testid="skills-matrix-empty">
        <p className="text-sm text-muted-foreground">No skills data available for this view.</p>
      </div>
    );
  }

  // Build lookup map
  const cellMap = new Map<string, SkillsMatrixCell>();
  for (const c of cells) {
    cellMap.set(`${c.employeeId}:${c.skillId}`, c);
  }

  return (
    <div className="space-y-4" data-testid="skills-matrix">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.departmentId ?? ""}
          onValueChange={(v) => setFilters((f) => ({ ...f, departmentId: v || undefined }))}
        >
          <SelectTrigger className="w-[180px]" data-testid="matrix-dept-filter">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {/* Departments come from API response — rendered dynamically */}
            {[...new Set(employees.map((e) => e.department))].map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.skillCategory ?? ""}
          onValueChange={(v) => setFilters((f) => ({ ...f, skillCategory: v || undefined }))}
        >
          <SelectTrigger className="w-[180px]" data-testid="matrix-category-filter">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {[...new Set(skills.map((s) => s.category).filter(Boolean))].map((cat) => (
              <SelectItem key={cat!} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Heatmap table */}
      <div className="overflow-x-auto rounded-lg border" style={{ maxHeight: "70vh" }}>
        <table className="w-full text-sm" data-testid="skills-matrix-table">
          <thead className="sticky top-0 bg-muted/50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                Employee
              </th>
              {skills.map((skill) => (
                <th
                  key={skill.id}
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {skill.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{emp.name}</td>
                {skills.map((skill) => {
                  const cell = cellMap.get(`${emp.id}:${skill.id}`);
                  return (
                    <td
                      key={skill.id}
                      className="relative px-3 py-2 text-center"
                      data-testid={`cell-${emp.id}-${skill.id}`}
                    >
                      <div
                        className={cn(
                          "mx-auto flex h-8 w-8 items-center justify-center rounded text-xs font-medium text-white",
                          getCellColor(cell?.level ?? null),
                          !cell?.isValidated && cell?.level !== null && "border-2 border-dashed border-white",
                        )}
                        title={cell ? `${cell.skillName}: Level ${cell.level ?? "—"}` : "Not assessed"}
                        aria-label={
                          cell
                            ? `${emp.name} — ${cell.skillName}: Level ${cell.level ?? "—"}${cell.isValidated ? " (Validated)" : " (Self-assessed)"}${cell.hasGap ? " — Skill gap" : ""}`
                            : `${emp.name} — ${skill.name}: Not assessed`
                        }
                      >
                        {cell?.level ?? "—"}
                      </div>
                      {cell?.hasGap && (
                        <AlertTriangle
                          className="absolute -right-0.5 -top-0.5 h-3 w-3 text-red-500"
                          aria-hidden="true"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground" data-testid="skills-matrix-legend">
        <span>Levels:</span>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <span key={lvl} className="flex items-center gap-1">
            <span className={cn("inline-block h-3 w-3 rounded", getCellColor(lvl))} aria-hidden="true" />
            {lvl}
          </span>
        ))}
        <span className="ml-4">— Not assessed</span>
        <span className="ml-4">Dashed border = Self-assessed</span>
        <span className="ml-4">⚠ = Skill gap</span>
      </div>
    </div>
  );
}
