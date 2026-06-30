import type { Metadata } from "next";
import { AuditLogViewer } from "@/features/audit/components/AuditLogViewer";

export const metadata: Metadata = {
  title: "Audit Logs - HR Platform",
};

const EMPTY_INITIAL = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
};

export default function AuditLogsPage() {
  return <AuditLogViewer initialData={EMPTY_INITIAL} />;
}
