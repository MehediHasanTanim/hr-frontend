"use client";

import type { DocumentCategory } from "../types/document.types";

const categoryColors: Record<DocumentCategory, string> = {
  CONTRACT: "bg-blue-100 text-blue-800",
  NID: "bg-purple-100 text-purple-800",
  CERTIFICATE: "bg-green-100 text-green-800",
  PAYSLIP: "bg-amber-100 text-amber-800",
  OTHER: "bg-gray-100 text-gray-800",
};

interface DocumentCategoryBadgeProps {
  category: DocumentCategory;
}

export function DocumentCategoryBadge({ category }: DocumentCategoryBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[category]}`}
    >
      {category}
    </span>
  );
}
