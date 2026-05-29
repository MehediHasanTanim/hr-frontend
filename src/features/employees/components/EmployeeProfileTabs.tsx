"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmploymentHistoryTimeline } from "@/features/employees/components/EmploymentHistoryTimeline";
import type { Employee, EmploymentHistoryRecord } from "@/features/employees/types/employee.types";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Documents", "History", "Leave", "Payroll"] as const;

function maskAccount(value?: string) {
  if (!value) {
    return "-";
  }
  return value.length <= 4 ? "****" : `**** **** ${value.slice(-4)}`;
}

function Detail({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "-"}</dd>
    </div>
  );
}

function Overview({ employee }: { employee: Employee }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Detail label="Email" value={employee.email} />
        <Detail label="Phone" value={employee.phone} />
        <Detail label="Work email" value={employee.workEmail} />
        <Detail label="Date of birth" value={employee.dateOfBirth} />
        <Detail label="Gender" value={employee.gender?.replaceAll("_", " ")} />
        <Detail label="National ID" value={employee.nationalId} />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Detail label="Department" value={employee.departmentName} />
        <Detail label="Job title" value={employee.jobTitle} />
        <Detail label="Location" value={employee.location} />
        <Detail label="Manager" value={employee.managerName} />
        <Detail label="Joining date" value={employee.joiningDate} />
        <Detail label="Pay grade" value={employee.payGrade} />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Detail label="Bank" value={employee.bankName} />
        <Detail label="Account holder" value={employee.accountHolderName} />
        <Detail label="Account number" value={maskAccount(employee.accountNumber)} />
        <Detail label="Routing number" value={employee.routingNumber} />
      </section>
    </div>
  );
}

export function EmployeeProfileTabs({
  employee,
  history,
}: {
  employee: Employee;
  history?: EmploymentHistoryRecord[] | undefined;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab}
            className={cn("rounded-b-none", activeTab === tab && "border-b-primary text-primary")}
            type="button"
            variant="ghost"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>
      {activeTab === "Overview" ? <Overview employee={employee} /> : null}
      {activeTab === "Documents" ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Documents will appear here when file storage is connected. Upload support is ready for the backend endpoint.
        </div>
      ) : null}
      {activeTab === "History" ? <EmploymentHistoryTimeline records={history} /> : null}
      {activeTab === "Leave" ? (
        <div className="rounded-lg border p-6">
          <Badge variant="outline">Leave summary</Badge>
          <p className="mt-3 text-sm text-muted-foreground">Leave balances and recent leave activity will render here.</p>
        </div>
      ) : null}
      {activeTab === "Payroll" ? (
        <div className="rounded-lg border p-6">
          <Badge variant="outline">Payroll summary</Badge>
          <p className="mt-3 text-sm text-muted-foreground">Compensation, payslip, and deduction summaries will render here.</p>
        </div>
      ) : null}
    </div>
  );
}
