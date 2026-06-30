"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentList } from "./DocumentList";
import { DocumentUploadDropzone } from "./DocumentUploadDropzone";
import type { DocumentCategory } from "../types/document.types";

const CATEGORIES: { label: string; value: DocumentCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Contract", value: "CONTRACT" },
  { label: "NID", value: "NID" },
  { label: "Certificate", value: "CERTIFICATE" },
  { label: "Payslip", value: "PAYSLIP" },
  { label: "Other", value: "OTHER" },
];

interface DocumentVaultProps {
  employeeId: string;
  userRole?: string;
}

export function DocumentVault({
  employeeId,
  userRole = "EMPLOYEE",
}: DocumentVaultProps) {
  const [activeCategory, setActiveCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [showUpload, setShowUpload] = useState(false);
  const isHrAdmin = userRole === "HR_ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Document Vault</h2>
        <Button
          size="sm"
          onClick={() => setShowUpload((prev) => !prev)}
          variant={showUpload ? "secondary" : "outline"}
        >
          <Upload className="size-4 mr-1" />
          {showUpload ? "Cancel" : "Upload Document"}
        </Button>
      </div>

      {showUpload && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <DocumentUploadDropzone
            employeeId={employeeId}
            onSuccess={() => setShowUpload(false)}
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            size="xs"
            variant={activeCategory === cat.value ? "default" : "outline"}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <DocumentList
        employeeId={employeeId}
        category={
          activeCategory === "all"
            ? undefined
            : (activeCategory as DocumentCategory)
        }
        userRole={userRole}
      />
    </div>
  );
}
