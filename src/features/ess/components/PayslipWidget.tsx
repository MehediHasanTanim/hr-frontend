// src/features/ess/components/PayslipWidget.tsx
// Sprint 6 — ESS payslip widget (last 3, download, no S3 key in DOM)

"use client";

import React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";

interface PayslipItem {
  id: string;
  period: string;
  netPay: number;
  createdAt: string;
}

export function PayslipWidget() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PAYSLIPS({ limit: "3" }),
    queryFn: () =>
      apiClient
        .get<{ data: PayslipItem[] }>("/api/v1/me/payslips", { params: { limit: 3 } })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const payslips = data?.data ?? [];

  async function handleDownload(id: string) {
    const res = await apiClient.get<{ url: string }>(
      `/api/v1/payroll/payslips/${id}/download`,
    );
    // Open the signed URL in a new tab — s3Key never touches the DOM
    window.open(res.data.url, "_blank", "noopener noreferrer");
  }

  return (
    <Card data-testid="payslip-widget">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">My Payslips</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/me/payslips">
            View All <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))
        ) : payslips.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No payslips available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {payslips.map((ps) => (
              <div
                key={ps.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
                data-testid="payslip-row"
              >
                <div>
                  <p className="text-sm font-medium">{ps.period}</p>
                  <p className="text-xs text-muted-foreground">
                    Net: ৳ {ps.netPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(ps.id)}
                  aria-label={`Download payslip for ${ps.period}`}
                  data-testid="payslip-download-btn"
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
