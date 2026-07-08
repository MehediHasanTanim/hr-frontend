// src/app/(dashboard)/benefits/enroll/page.tsx
// Sprint 10 F1 — Benefits Enrollment Page

import React from "react";
import { EnrollmentWizard } from "@/features/benefits/components/EnrollmentWizard";

export default function BenefitsEnrollPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Benefits Enrollment</h1>
      <EnrollmentWizard />
    </div>
  );
}
