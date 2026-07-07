// src/types/performance.ts
// Sprint 8 — Performance Management, OKR, PIP, Review, Calibration types

export type GoalType = 'objective' | 'key_result';
export type GoalStatus = 'not_started' | 'on_track' | 'at_risk' | 'completed' | 'cancelled';
export type ReviewStatus = 'not_started' | 'in_progress' | 'submitted';
export type PipStatus = 'active' | 'closed';
export type PipOutcome = 'successful' | 'extended' | 'terminated' | 'resigned' | null;
export type PipCheckInRating = 'on_track' | 'at_risk' | 'off_track' | null;

// ─── OKR / Goals ─────────────────────────────────────────────────
export interface Goal {
  id: string;
  employeeId: string;
  parentGoalId: string | null;
  cycleId: string | null;
  title: string;
  description: string | null;
  goalType: GoalType;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  weight: number | null;
  status: GoalStatus;
  dueDate: string | null;
  children: Goal[];
}

export interface GoalCheckIn {
  id: string;
  goalId: string;
  postedBy: string;
  postedByName?: string;
  note: string;
  valueAtCheckIn: number | null;
  createdAt: string;
}

// ─── Performance Review ──────────────────────────────────────────
export interface ReviewFormSection {
  key: string;
  title: string;
  type: 'rating_scale' | 'text' | 'multi_rating';
  ratingScale?: { min: number; max: number; labels?: Record<number, string> };
  required: boolean;
}

export interface ReviewFormTemplate {
  id: string;
  name: string;
  sections: ReviewFormSection[];
}

export interface PerformanceReview {
  id: string;
  cycleId: string;
  employeeId: string;
  employeeName?: string;
  managerId: string;
  managerName?: string;
  formTemplateId: string;
  formTemplate?: ReviewFormTemplate;
  selfReviewStatus: ReviewStatus;
  managerReviewStatus: ReviewStatus;
  overallRating: string | null;
  acknowledgedByEmployee: boolean;
}

export interface ReviewResponse {
  sectionKey: string;
  respondentRole: 'self' | 'manager';
  responseJson: Record<string, unknown>;
  submittedAt: string | null;
}

// ─── Calibration ─────────────────────────────────────────────────
export interface CalibrationRow {
  performanceReviewId: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  selfReviewStatus: string;
  managerReviewStatus: string;
  computedRating: string;
  calibratedRating: string | null;
}

// ─── PIP ─────────────────────────────────────────────────────────
export interface PerformanceImprovementPlan {
  id: string;
  employeeId: string;
  employeeName?: string;
  managerId: string;
  managerName?: string;
  reason: string;
  goals: string;
  startDate: string;
  endDate: string;
  status: PipStatus;
  outcome: PipOutcome;
  outcomeNotes: string | null;
  checkIns: PipCheckIn[];
}

export interface PipCheckIn {
  id: string;
  postedBy: string;
  postedByName?: string;
  note: string;
  ratingAtCheckIn: PipCheckInRating;
  checkInDate: string;
}

// ─── Pagination ──────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
