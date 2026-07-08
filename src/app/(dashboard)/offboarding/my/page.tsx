// src/app/(dashboard)/offboarding/my/page.tsx
// Sprint 11 F4 — Employee-facing offboarding portal

"use client";
import React from "react";
import { ResignationForm } from "@/features/offboarding/components/ResignationForm";

export default function MyOffboardingPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Offboarding</h1>
      <ResignationForm employeeId="current" />
    </div>
  );
}
