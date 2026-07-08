// src/features/benefits/types/benefits.types.ts
// Sprint 10 — Benefits Enrollment Types

export type BenefitPlanType =
  | "HEALTH"
  | "DENTAL"
  | "VISION"
  | "LIFE"
  | "RETIREMENT"
  | "WELLNESS"
  | "OTHER";

export type BenefitEnrollmentStatus =
  | "PENDING"
  | "ACTIVE"
  | "WAIVED"
  | "TERMINATED";

export type DependentRelationship =
  | "SPOUSE"
  | "CHILD"
  | "DOMESTIC_PARTNER"
  | "OTHER";

export interface BenefitPlan {
  id: string;
  name: string;
  type: BenefitPlanType;
  employerContribution: number;
  employeeContribution: number;
  coverageTiers: { tier: string; employeeCost: number }[];
  providerName: string;
}

export interface EnrollmentWindow {
  id: string;
  name: string;
  opensAt: string;
  closesAt: string;
  status: "SCHEDULED" | "OPEN" | "CLOSED";
  eligiblePlanIds: string[];
}

export interface Dependent {
  fullName: string;
  relationship: DependentRelationship;
  dateOfBirth: string;
}

export interface SubmitEnrollmentDto {
  benefitPlanId: string;
  enrollmentWindowId: string;
  coverageTier: string;
  dependents: Dependent[];
}

export interface MyEnrollment {
  id: string;
  benefitPlanId: string;
  benefitPlanName: string;
  coverageTier: string;
  status: BenefitEnrollmentStatus;
  dependents: Dependent[];
  submittedAt: string;
}
