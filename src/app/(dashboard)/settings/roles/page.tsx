// src/app/(dashboard)/settings/roles/page.tsx
// Sprint 6 1.6.F5-A — Roles & Permissions page

"use client";

import React from "react";
import { PermissionsMatrix } from "@/features/settings/components/PermissionsMatrix";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles &amp; Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Configure role-based access for every feature.
        </p>
      </div>
      <PermissionsMatrix />
    </div>
  );
}
