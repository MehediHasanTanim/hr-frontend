// src/features/dashboard/components/QuickActions.tsx
// Sprint 6 — Dashboard quick action buttons, role-aware

"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Button } from "@/components/ui/button";
import { CalendarCheck, PlusCircle, PlayCircle } from "lucide-react";

export function QuickActions() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <div
      className="flex flex-wrap gap-3"
      data-testid="quick-actions"
    >
      {role === "HR_ADMIN" && (
        <Button asChild variant="outline" size="sm" data-testid="action-run-payroll">
          <Link href="/payroll/runs/new">
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Payroll
          </Link>
        </Button>
      )}

      {(role === "MANAGER" || role === "HR_ADMIN") && (
        <Button asChild variant="outline" size="sm" data-testid="action-approve-leaves">
          <Link href="/mss/approvals">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Approve Leaves
          </Link>
        </Button>
      )}

      {role === "HR_ADMIN" && (
        <Button asChild variant="outline" size="sm" data-testid="action-add-employee">
          <Link href="/employees/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      )}
    </div>
  );
}
