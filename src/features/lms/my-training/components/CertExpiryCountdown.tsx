// src/features/lms/my-training/components/CertExpiryCountdown.tsx
// Sprint 9 F5 — Certification expiry countdown card

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MyCertification } from "@/types/lms";

interface CertExpiryCountdownProps {
  cert: MyCertification;
}

export function CertExpiryCountdown({ cert }: CertExpiryCountdownProps) {
  const days = cert.daysUntilExpiry;

  function getStatusInfo() {
    if (cert.verificationStatus === 'expired' || cert.verificationStatus === 'revoked')
      return { label: cert.verificationStatus, color: 'destructive' as const };
    if (cert.verificationStatus === 'verified')
      return { label: 'Verified', color: 'secondary' as const };
    return { label: 'Unverified', color: 'outline' as const };
  }

  function getExpiryColor() {
    if (days === null) return 'text-muted-foreground';
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-red-600';
    if (days <= 30) return 'text-amber-600';
    return 'text-muted-foreground';
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-lg border p-3" data-testid={`cert-card-${cert.id}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{cert.certificationName}</p>
        <Badge variant={statusInfo.color} className="text-xs">{statusInfo.label}</Badge>
      </div>
      {days !== null && (
        <p className={cn("mt-1 text-xs", getExpiryColor())}>
          {days < 0
            ? `Expired ${Math.abs(days)} days ago`
            : days === 0
              ? 'Expires today'
              : `Expires in ${days} days`}
        </p>
      )}
    </div>
  );
}
