"use client";

import { useState } from "react";
import type { Metadata } from "next";

import { EsignRequestList } from "@/features/esign/components/EsignRequestList";
import { CreateEsignRequestModal } from "@/features/esign/components/CreateEsignRequestModal";
import { useEsignRequests } from "@/features/esign/hooks/useEsignRequests";
import type { EsignStatus } from "@/features/esign/types/esign.types";

export default function EsignListPage() {
  const [statusFilter, setStatusFilter] = useState<EsignStatus | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: requests, isLoading } = useEsignRequests(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
  );

  return (
    <>
      <EsignRequestList
        requests={requests ?? []}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onCreateRequest={() => setShowCreateModal(true)}
      />
      {showCreateModal && (
        <CreateEsignRequestModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
