"use client";

import { useEffect, useCallback } from "react";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AuditLogEntry } from "../types/audit.types";
import { cn } from "@/lib/utils";

interface AuditDiffDrawerProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

export function AuditDiffDrawer({
  entry,
  onClose,
}: AuditDiffDrawerProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!entry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entry, onClose]);

  // Focus trap
  useEffect(() => {
    if (!entry) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entry]);

  if (!entry) return null;

  const hasBeforeAfter =
    entry.metadata && "before" in entry.metadata && "after" in entry.metadata;

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-background border-l shadow-lg transform transition-transform",
          entry ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label="Audit log diff viewer"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <p className="font-semibold text-sm">{entry.action}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actor</span>
                <span>{entry.actorName || entry.actorId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resource Type</span>
                <span>{entry.resourceType || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Resource ID</span>
                <span className="flex items-center gap-1">
                  {entry.resourceId ?? "—"}
                  {entry.resourceId && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(entry.resourceId!)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </span>
              </div>
            </div>

            {/* Metadata Diff */}
            <div>
              <h4 className="font-medium text-sm mb-2">Metadata</h4>
              {!entry.metadata ||
              Object.keys(entry.metadata).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No additional metadata.
                </p>
              ) : hasBeforeAfter ? (
                <table className="w-full text-xs border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-2 py-1 text-left font-medium">
                        Field
                      </th>
                      <th className="px-2 py-1 text-left font-medium">
                        Before
                      </th>
                      <th className="px-2 py-1 text-left font-medium">
                        After
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      (entry.metadata as Record<string, unknown>)
                        .before as Record<string, unknown> || {},
                    ).map(([field, beforeVal]) => {
                      const afterVal = (
                        (entry.metadata as Record<string, unknown>)
                          .after as Record<string, unknown>
                      )?.[field];
                      const changed = beforeVal !== afterVal;
                      return (
                        <tr key={field} className="border-t">
                          <td className="px-2 py-1 font-medium">
                            {field}
                          </td>
                          <td
                            className={`px-2 py-1 ${
                              changed
                                ? "text-red-600 line-through"
                                : ""
                            }`}
                          >
                            {String(beforeVal ?? "—")}
                          </td>
                          <td
                            className={`px-2 py-1 ${
                              changed ? "text-green-600" : ""
                            }`}
                          >
                            {String(afterVal ?? "—")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <pre className="text-xs overflow-x-auto bg-muted rounded p-3">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              )}
            </div>

            {/* IP Address */}
            {entry.ipAddress && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <span>{entry.ipAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
