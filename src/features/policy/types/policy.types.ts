export type PolicyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PolicyCategory = 'HR' | 'IT' | 'FINANCE' | 'GENERAL';

export interface Policy {
  id: string;
  title: string;
  content: string;
  category: PolicyCategory;
  status: PolicyStatus;
  createdBy: string;
  publishedBy: string | null;
  publishedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  acknowledgedByMe?: boolean;
  acknowledgementCount?: number;
  totalEmployees?: number;
}

export interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  employeeId: string;
  acknowledgedAt: string;
}

export interface AcknowledgementStats {
  acknowledgedCount: number;
  pendingCount: number;
  totalEmployees: number;
}

export interface CreatePolicyPayload {
  title: string;
  content: string;
  category: PolicyCategory;
}
