"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast.store";
import { PolicyCard } from "./PolicyCard";
import { AcknowledgeModal } from "./AcknowledgeModal";
import { usePolicies, usePublishPolicy, useArchivePolicy } from "../hooks/usePolicies";
import type { Policy, PolicyStatus } from "../types/policy.types";

const STATUS_FILTERS: { label: string; value: PolicyStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

interface PolicyLibraryProps {
  userRole: string;
}

export function PolicyLibrary({ userRole }: PolicyLibraryProps) {
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | "all">("all");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [acknowledgeMode, setAcknowledgeMode] = useState<"acknowledge" | "view">(
    "view",
  );
  const { data: policies, isLoading } = usePolicies();
  const publishMutation = usePublishPolicy();
  const archiveMutation = useArchivePolicy();
  const addToast = useToastStore((s) => s.addToast);

  const isHrAdmin = userRole === "HR_ADMIN";

  const filteredPolicies = (policies ?? []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (!isHrAdmin && p.status !== "PUBLISHED") return false;
    return true;
  });

  const handleAcknowledge = (policy: Policy) => {
    setSelectedPolicy(policy);
    setAcknowledgeMode(
      policy.acknowledgedByMe ? "view" : "acknowledge",
    );
  };

  const handlePublish = (policyId: string) => {
    publishMutation.mutate(policyId, {
      onSuccess: () => {
        addToast({ message: "Policy published successfully", variant: "success", duration: 3000 });
      },
      onError: () => {
        addToast({ message: "Failed to publish policy", variant: "danger", duration: 3000 });
      },
    });
  };

  const handleArchive = (policyId: string) => {
    archiveMutation.mutate(policyId, {
      onSuccess: () => {
        addToast({ message: "Policy archived", variant: "success", duration: 3000 });
      },
      onError: () => {
        addToast({ message: "Failed to archive policy", variant: "danger", duration: 3000 });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isHrAdmin ? "Policy Library" : "Company Policies"}
        </h2>
        {isHrAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              addToast({
                message: "Coming soon",
                variant: "info",
                duration: 3000,
              })
            }
          >
            <Plus className="size-4 mr-1" />
            New Policy
          </Button>
        )}
      </div>

      {isHrAdmin && (
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s.value}
              size="xs"
              variant={statusFilter === s.value ? "default" : "outline"}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No policies found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              userRole={userRole}
              onAcknowledge={handleAcknowledge}
              onPublish={handlePublish}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {selectedPolicy && (
        <AcknowledgeModal
          policy={selectedPolicy}
          readOnly={acknowledgeMode === "view"}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </div>
  );
}
