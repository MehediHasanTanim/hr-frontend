import { AppShell } from "@/components/layout/AppShell";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
