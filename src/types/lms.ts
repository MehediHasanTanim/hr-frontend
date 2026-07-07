// src/types/lms.ts
// Sprint 9 — Learning Management System types

export type CourseFormat = 'self_paced' | 'instructor_led' | 'external_link';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';
export type CertVerificationStatus = 'unverified' | 'verified' | 'expired' | 'revoked';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  format: CourseFormat;
  externalUrl: string | null;
  durationMinutes: number;
  status: CourseStatus;
  isMandatory: boolean;
  skillTags: { id: string; name: string }[];
}

export interface CourseListFilters {
  category?: string;
  format?: CourseFormat;
  isMandatory?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  employeeId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
  certificateAvailable: boolean;
  assignmentId: string | null;
}

export interface MyTrainingItem {
  enrollmentId: string;
  courseTitle: string;
  isMandatory: boolean;
  deadlineAt: string | null;
  progressPercent: number;
  status: EnrollmentStatus;
  isOverdue: boolean;
}

export interface MyCertification {
  id: string;
  certificationName: string;
  expiryDate: string | null;
  daysUntilExpiry: number | null;
  verificationStatus: CertVerificationStatus;
}

export interface LearningPathStep {
  courseId: string;
  courseTitle: string;
  sequenceOrder: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  prerequisiteTitle: string | null;
}

export interface LearningPath {
  id: string;
  name: string;
  steps: LearningPathStep[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
