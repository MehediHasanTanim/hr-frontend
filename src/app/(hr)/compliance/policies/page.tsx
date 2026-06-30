import type { Metadata } from "next";
import { PolicyLibrary } from "@/features/policy/components/PolicyLibrary";

export const metadata: Metadata = {
  title: "Policy Library - HR Platform",
};

export default function PolicyLibraryPage() {
  return <PolicyLibrary userRole="HR_ADMIN" />;
}
