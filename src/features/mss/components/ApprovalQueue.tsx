// src/features/mss/components/ApprovalQueue.tsx
// Sprint 6 — MSS approval queue with tabs

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useMssStore } from "../store/mss.store";
import { LeaveApprovalsTab } from "./LeaveApprovalsTab";
import { Badge } from "@/components/ui/badge";
import { useTeamLeaveRequests } from "../hooks/useTeamLeaveRequests";

type ApprovalTab = "leave" | "attendance";

export function ApprovalQueue() {
  const { activeTab, setTab } = useMssStore();
  const { data } = useTeamLeaveRequests({ status: "PENDING", limit: 1 });

  const pendingCount = data?.total ?? 0;

  const tabs: { key: ApprovalTab; label: string; count: number }[] = [
    { key: "leave", label: "Leave Requests", count: pendingCount },
    { key: "attendance", label: "Attendance Corrections", count: 0 },
  ];

  return (
    <div data-testid="approval-queue">
      {/* ─── Tabs ───────────────────────────────────── */}
      <div className="mb-4 flex gap-1 border-b" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="text-xs" data-testid="pending-total-badge">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ────────────────────────────── */}
      {activeTab === "leave" && <LeaveApprovalsTab />}
      {activeTab === "attendance" && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Attendance correction approvals coming soon.
        </div>
      )}
    </div>
  );
}
