// src/types/recruitment.ts
// Sprint 7 — Recruitment & ATS types
// Mirrors backend DTOs/entities field-for-field.
// Enums as string literal unions (not TS enum) for strict + serialization compat.

// ─── Status enums ─────────────────────────────────────────────────
export type RequisitionStatus =
  | 'draft'
  | 'pending_approval'
  | 'open'
  | 'on_hold'
  | 'closed'
  | 'cancelled';

export type ApplicationStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type OfferStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'rescinded'
  | 'expired';

export type InterviewMode = 'onsite' | 'video' | 'phone';

export type Recommendation = 'strong_yes' | 'yes' | 'no' | 'strong_no';

// ─── Entities ──────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
}

export interface JobRequisition {
  id: string;
  title: string;
  departmentId: string;
  department?: Department;
  location: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  positionsRequested: number;
  positionsFilled: number;
  status: RequisitionStatus;
  description: string;
  requirements: string;
  responsibilities: string;
  approverId?: string;
  approverName?: string;
  requestedById: string;
  requestedByName?: string;
  reasonForHire?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  linkedinUrl?: string;
  source: 'careers_portal' | 'referral' | 'linkedin' | 'agency' | 'direct' | 'other';
  sourceDetail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  requisitionId: string;
  candidateId: string;
  candidate?: Candidate;
  stage: ApplicationStage;
  currentScore?: number;
  appliedAt: string;
  lastStageMovedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewPanelist {
  id: string;
  interviewId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'chair' | 'member' | 'observer';
  hasSubmitted: boolean;
}

export interface Interview {
  id: string;
  applicationId: string;
  requisitionId: string;
  candidateId: string;
  mode: InterviewMode;
  scheduledAt?: string;
  durationMinutes: number;
  locationOrLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  panelists: InterviewPanelist[];
  overallScore?: number;
  overallRecommendation?: Recommendation;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewScorecard {
  id: string;
  interviewId: string;
  panelistId: string;
  panelistName: string;
  criteria: ScorecardCriterion[];
  overallRecommendation: Recommendation;
  strengths: string;
  weaknesses: string;
  notes: string;
  submittedAt: string;
}

export interface ScorecardCriterion {
  name: string;
  weight: number; // 0–1
  score: number; // 1–5
  weightedScore: number;
  comment?: string;
}

export interface Offer {
  id: string;
  applicationId: string;
  candidateId: string;
  requisitionId: string;
  status: OfferStatus;
  salary: number;
  currency: string;
  benefits?: Record<string, unknown>;
  startDate?: string;
  expiryDate: string;
  notes?: string;
  acceptedAt?: string;
  declinedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ──────────────────────────────────────────────────────────

export interface CreateRequisitionDto {
  title: string;
  departmentId: string;
  location: string;
  employmentType: JobRequisition['employmentType'];
  minSalary?: number;
  maxSalary?: number;
  positionsRequested: number;
  description: string;
  requirements: string;
  responsibilities: string;
  targetDate?: string;
  reasonForHire?: string;
}

export interface RequisitionFilters {
  status?: RequisitionStatus;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationFilters {
  requisitionId: string;
  stage?: ApplicationStage;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MoveStageDto {
  stage: ApplicationStage;
  notes?: string;
}

export interface RejectApplicationDto {
  reason: string;
}

export interface ScheduleInterviewDto {
  mode: InterviewMode;
  scheduledAt: string;
  durationMinutes: number;
  locationOrLink?: string;
  panelistIds: string[];
}

export interface SubmitScorecardDto {
  criteria: ScorecardCriterion[];
  overallRecommendation: Recommendation;
  strengths: string;
  weaknesses: string;
  notes: string;
}

export interface CreateOfferDto {
  salary: number;
  currency: string;
  benefits?: Record<string, unknown>;
  startDate?: string;
  expiryDate: string;
  notes?: string;
}

// ─── Paginated responses ───────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Kanban DnD types (client-only) ────────────────────────────────

export interface KanbanDragEvent {
  applicationId: string;
  fromStage: ApplicationStage;
  toStage: ApplicationStage;
}

// ─── Stage display config ──────────────────────────────────────────

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const STAGE_ORDER: ApplicationStage[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
];

export const TERMINAL_STAGES: ApplicationStage[] = ['rejected', 'withdrawn'];

export const DRAG_DISABLED_STAGES: ApplicationStage[] = ['hired'];

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  screening: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
  interview: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
  offer: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  hired: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
  rejected: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  withdrawn: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
};
