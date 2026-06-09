"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Download, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { usePayslip } from "@/features/payroll/api/payslips";

export function PayslipViewer({
  payslipId,
  isHrView = false,
}: {
  payslipId: string;
  isHrView?: boolean;
}) {
  const { data: payslip, isLoading, error, refetch } = usePayslip(payslipId);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [refreshBanner, setRefreshBanner] = useState(false);

  // Auto-refresh signed URL before expiry (50 min timer)
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: fresh } = await refetch();
      if (fresh?.downloadUrl && iframeRef.current) {
        iframeRef.current.src = fresh.downloadUrl;
        setRefreshBanner(true);
        setTimeout(() => setRefreshBanner(false), 3000);
      }
    }, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load payslip
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left panel */}
      <div className="w-[400px] shrink-0 space-y-4">
        <Link
          href={isHrView ? "/payroll/payslips" : "/payslips"}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← All payslips
        </Link>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            {(payslip as unknown as Record<string, string>).employeeName ??
              "Employee"}
            {" · "}
            {(payslip as unknown as Record<string, string>).employeeCode ??
              ""}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
          </p>
          <p className="mt-3 text-2xl font-medium">
            {payslip.netPayable.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            Generated {format(new Date(payslip.generatedAt), "d MMM yyyy")}
          </p>

          {payslip.downloadUrl && (
            <a
              href={payslip.downloadUrl}
              download
              target="_blank"
              rel="noreferrer"
            >
              <Button className="mt-4 w-full" size="sm" type="button">
                <Download className="mr-1 size-4" />
                Download PDF
              </Button>
            </a>
          )}

          {/* Component breakdown */}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? "Hide breakdown" : "Show breakdown"}
            {showBreakdown ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {showBreakdown && (
            <div className="mt-2 space-y-2 text-xs">
              <p className="text-xs font-medium text-green-700">Earnings</p>
              <p className="text-muted-foreground">
                Component details will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — PDF embed */}
      <div className="relative flex-1">
        {refreshBanner && (
          <div className="absolute right-0 top-0 z-10 rounded-md bg-green-100 px-3 py-1 text-xs text-green-800">
            Payslip URL refreshed ✓
          </div>
        )}

        {payslip.downloadUrl && !iframeFailed ? (
          <iframe
            ref={iframeRef}
            src={payslip.downloadUrl}
            title="Payslip PDF"
            aria-label="Payslip document viewer"
            style={{ width: "100%", height: "80vh", border: "none" }}
            className="rounded-lg"
            onError={() => setIframeFailed(true)}
          />
        ) : (
          <div className="flex h-[80vh] flex-col items-center justify-center rounded-lg border bg-muted/20">
            <p className="mb-2 text-sm text-muted-foreground">
              PDF preview is not available in your browser.
            </p>
            {payslip.downloadUrl && (
              <a
                href={payslip.downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" type="button">
                  <Download className="mr-1 size-4" />
                  Download PDF to view
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
