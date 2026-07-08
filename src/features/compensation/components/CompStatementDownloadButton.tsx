// src/features/compensation/components/CompStatementDownloadButton.tsx
// Sprint 10 F2 — Download compensation statement
// §8 open question: client-rendered PDF vs server-generated signed URL.
// Currently opens a print-ready view; replace with signed URL when confirmed.

"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompStatementDownloadButtonProps {
  employeeId: string;
}

export function CompStatementDownloadButton({
  employeeId: _employeeId,
}: CompStatementDownloadButtonProps) {
  const handleDownload = () => {
    // Placeholder: triggers print view
    // Replace with window.open(signedUrl) when backend endpoint is ready
    window.print();
  };

  return (
    <button
      type="button"
      data-testid="comp-statement-download-btn"
      onClick={handleDownload}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium",
        "hover:bg-muted transition-colors",
      )}
    >
      <Download className="h-4 w-4" />
      Download Statement
    </button>
  );
}
