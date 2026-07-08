// src/features/offboarding/types/offboarding.ts
// Sprint 11 — Offboarding Types (mirrors backend DTOs)

export type ExitReasonType =
  | "RESIGNATION"
  | "TERMINATION"
  | "RETIREMENT"
  | "END_OF_CONTRACT";

export type ExitRequestStatus =
  | "SUBMITTED"
  | "PENDING_MANAGER_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "INTERVIEW_SCHEDULED"
  | "CHECKLIST_IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ChecklistTaskCategory =
  | "IT"
  | "FINANCE"
  | "HR"
  | "FACILITIES"
  | "MANAGER";

export type ChecklistTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED";

export interface ExitRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  reasonType: ExitReasonType;
  reasonNotes?: string;
  requestedLastWorkingDay: string;
  approvedLastWorkingDay?: string;
  status: ExitRequestStatus;
  submittedById: string;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ExitInterview {
  id: string;
  exitRequestId: string;
  scheduledAt?: string;
  conductedById?: string;
  conductedAt?: string;
  responses?: { question: string; answer: string }[];
  overallSentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  isCompleted: boolean;
}

export interface OffboardingChecklistTask {
  id: string;
  exitRequestId: string;
  taskName: string;
  category: ChecklistTaskCategory;
  assignedToId?: string;
  status: ChecklistTaskStatus;
  completedById?: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
}

export interface CreateExitRequestDto {
  employeeId: string;
  reasonType: ExitReasonType;
  reasonNotes?: string;
  requestedLastWorkingDay: string;
}

export interface RejectExitRequestDto {
  rejectionReason: string;
}

export interface CompleteChecklistTaskDto {
  notes?: string;
}

export interface SkipChecklistTaskDto {
  notes: string;
}

export interface RecordExitInterviewDto {
  scheduledAt?: string;
  responses?: { question: string; answer: string }[];
  overallSentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
}
