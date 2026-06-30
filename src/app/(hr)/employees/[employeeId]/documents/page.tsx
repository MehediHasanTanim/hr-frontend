import type { Metadata } from "next";
import { DocumentVault } from "@/features/documents/components/DocumentVault";

export const metadata: Metadata = {
  title: "Document Vault - HR Platform",
};

interface DocumentVaultPageProps {
  params: { employeeId: string };
}

export default function DocumentVaultPage({
  params,
}: DocumentVaultPageProps) {
  return <DocumentVault employeeId={params.employeeId} userRole="HR_ADMIN" />;
}
