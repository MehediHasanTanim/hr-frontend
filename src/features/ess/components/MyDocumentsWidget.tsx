// src/features/ess/components/MyDocumentsWidget.tsx
// Sprint 6 — ESS recent documents widget

"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronRight, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export function MyDocumentsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.MY_DOCUMENTS({ limit: 4, sort: "createdAt:desc" }),
    queryFn: () =>
      apiClient
        .get<{ data: DocumentItem[] }>("/api/v1/me/documents", {
          params: { limit: 4, sort: "createdAt:desc" },
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const docs = data?.data ?? [];

  async function handleDownload(id: string) {
    const res = await apiClient.get<{ url: string }>(
      `/api/v1/documents/${id}/download`,
    );
    window.open(res.data.url, "_blank", "noopener noreferrer");
  }

  return (
    <Card data-testid="my-documents-widget">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">My Documents</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/me/documents">
            View All <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <FolderOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No documents yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {doc.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(doc.uploadedAt), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc.id)}
                  aria-label={`Download ${doc.name}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
