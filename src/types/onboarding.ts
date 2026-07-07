// src/types/onboarding.ts
// Sprint 8 — Onboarding types

export type TaskCategory = 'paperwork' | 'it_setup' | 'training' | 'compliance' | 'team_intro' | 'other';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type AssigneeRole = 'employee' | 'manager' | 'hr' | 'it';
export type OnboardingStatus = 'in_progress' | 'completed' | 'cancelled';

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  paperwork: 'bg-blue-100 text-blue-800 border-blue-200',
  it_setup: 'bg-purple-100 text-purple-800 border-purple-200',
  training: 'bg-amber-100 text-amber-800 border-amber-200',
  compliance: 'bg-red-100 text-red-800 border-red-200',
  team_intro: 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export interface OnboardingTaskInstance {
  id: string;
  employeeOnboardingId: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  assigneeRole: AssigneeRole;
  dueDate: string;
  status: TaskStatus;
  completedBy: string | null;
  completedAt: string | null;
}

export interface EmployeeOnboardingSummary {
  id: string;
  employeeId: string;
  employeeName?: string;
  status: OnboardingStatus;
  hireDate: string;
  completionPercentage: number;
  tasks: OnboardingTaskInstance[];
}
