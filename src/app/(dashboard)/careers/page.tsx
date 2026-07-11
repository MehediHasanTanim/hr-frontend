// src/app/(dashboard)/careers/page.tsx — PUBLIC (no auth required for V2)
// Sprint 7 F2 — Public careers page for job listings and applications

import React from "react";

export default function CareersPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Join Our Team</h1>
      <p className="text-muted-foreground mb-6">
        Explore open positions and apply to join our growing team.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Currently No Open Positions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Check back soon for new opportunities. Job listings will appear here when requisitions are published.
          </p>
        </div>
      </div>
    </div>
  );
}
