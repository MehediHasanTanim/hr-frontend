"use client";

import { Check, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PolicyStatusBadge } from "./PolicyStatusBadge";
import type { Policy } from "../types/policy.types";
import { cn } from "@/lib/utils";

interface PolicyCardProps {
  policy: Policy;
  userRole: string;
  onAcknowledge?: (policy: Policy) => void;
  onPublish?: (policyId: string) => void;
  onArchive?: (policyId: string) => void;
}

export function PolicyCard({
  policy,
  userRole,
  onAcknowledge,
  onPublish,
  onArchive,
}: PolicyCardProps) {
  const isHrAdmin = userRole === "HR_ADMIN";
  const isPublished = policy.status === "PUBLISHED";
  const isDraft = policy.status === "DRAFT";
  const isAcknowledged = policy.acknowledgedByMe === true;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <PolicyStatusBadge status={policy.status} />
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {policy.category}
        </span>
      </div>

      <h3 className="font-semibold leading-tight line-clamp-2">
        {policy.title}
      </h3>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>v{policy.version}</span>
        {policy.publishedAt && (
          <>
            <span>·</span>
            <span>
              Published{" "}
              {new Date(policy.publishedAt).toLocaleDateString()}
            </span>
          </>
        )}
      </div>

      {isPublished && (
        <div className="space-y-2">
          {isHrAdmin ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {policy.acknowledgementCount ?? 0} /{" "}
                  {policy.totalEmployees ?? 0} acknowledged
                </span>
                <span>
                  {policy.totalEmployees
                    ? Math.round(
                        ((policy.acknowledgementCount ?? 0) /
                          policy.totalEmployees) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{
                    width: `${policy.totalEmployees ? Math.round(((policy.acknowledgementCount ?? 0) / policy.totalEmployees) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isAcknowledged ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="size-4" />
                  Acknowledged ✓
                </span>
              ) : (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <AlertCircle className="size-4 animate-pulse" />
                  Acknowledgement required
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        {!isHrAdmin && isPublished && !isAcknowledged && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onAcknowledge?.(policy)}
          >
            Read &amp; Acknowledge
          </Button>
        )}
        {!isHrAdmin && isPublished && isAcknowledged && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAcknowledge?.(policy)}
          >
            View Policy
          </Button>
        )}
        {isHrAdmin && isDraft && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onPublish?.(policy.id)}
          >
            Publish
          </Button>
        )}
        {isHrAdmin && isPublished && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onArchive?.(policy.id)}
          >
            Archive
          </Button>
        )}
      </div>
    </div>
  );
}
