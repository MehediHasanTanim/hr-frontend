"use client";

import { useParams } from "next/navigation";
import { SignerView } from "@/features/esign/components/SignerView";

export default function EsignDetailPage() {
  const params = useParams();
  const requestId = params.requestId as string;

  return <SignerView requestId={requestId} />;
}
