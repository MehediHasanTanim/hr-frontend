// src/features/settings/components/PermissionsMatrix.tsx
// Sprint 6 1.6.F5-A — Roles & Permissions matrix editor

"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRolesMatrix, useSaveRolesMatrix } from "../hooks/useRolesMatrix";
import { useSettingsStore } from "../store/settings.store";
import type { Role } from "@/types/auth.types";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CORE_HR_ADMIN_PERMISSIONS = ["payroll.view", "users.manage", "roles.edit", "settings.manage"];
const ROLES: Role[] = ["EMPLOYEE", "MANAGER", "HR_ADMIN"];

export function PermissionsMatrix() {
  const { data, isLoading } = useRolesMatrix();
  const saveMatrix = useSaveRolesMatrix();
  const { matrix, pendingChanges, setMatrix, togglePermission, discardChanges } =
    useSettingsStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (data) setMatrix(data);
  }, [data, setMatrix]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!matrix) return null;

  const filteredPermissions = matrix.permissions.filter(
    (p) =>
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  function hasPermission(role: Role, permKey: string): boolean {
    return matrix!.matrix[role]?.includes(permKey) ?? false;
  }

  function isCoreReadonly(role: Role, permKey: string): boolean {
    return role === "HR_ADMIN" && CORE_HR_ADMIN_PERMISSIONS.includes(permKey);
  }

  function isChanged(role: Role, permKey: string): boolean {
    return pendingChanges.has(`${role}:${permKey}`);
  }

  function handleSave() {
    if (!matrix) return;
    saveMatrix.mutate(matrix);
  }

  return (
    <div className="space-y-4" data-testid="permissions-matrix">
      {/* ─── Search ─────────────────────────────────── */}
      <input
        type="search"
        placeholder="Search permissions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        aria-label="Search permissions"
        data-testid="permission-search"
      />

      {/* ─── Matrix Table ────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                Permission
              </th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  scope="col"
                  className="px-3 py-2 text-center font-medium text-muted-foreground"
                >
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.map((perm) => (
              <tr
                key={perm.key}
                className={cn(
                  "border-t hover:bg-muted/30",
                  isChanged("EMPLOYEE", perm.key) || isChanged("MANAGER", perm.key) || isChanged("HR_ADMIN", perm.key)
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : "",
                )}
              >
                <td className="px-3 py-2">
                  <p className="font-medium">{perm.displayName}</p>
                  <p className="text-xs text-muted-foreground">{perm.category}</p>
                </td>
                {ROLES.map((role) => {
                  const checked = hasPermission(role, perm.key);
                  const readonly = isCoreReadonly(role, perm.key);
                  const cell = (
                    <td key={role} className="px-3 py-2 text-center">
                      {readonly ? (
                        <div className="flex items-center justify-center gap-1">
                          <Checkbox checked={true} disabled className="cursor-not-allowed opacity-50" />
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ) : (
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => togglePermission(role, perm.key, checked)}
                          aria-label={`${role}: ${perm.displayName}`}
                        />
                      )}
                    </td>
                  );

                  if (readonly) {
                    return (
                      <TooltipProvider key={role}>
                        <Tooltip>
                          <TooltipTrigger asChild>{cell}</TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">This permission cannot be removed from HR Admin.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }
                  return cell;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Actions ────────────────────────────────── */}
      <div className="flex gap-2">
        <Button
          disabled={pendingChanges.size === 0}
          onClick={handleSave}
          data-testid="save-permissions-btn"
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          disabled={pendingChanges.size === 0}
          onClick={discardChanges}
          data-testid="discard-permissions-btn"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}


