// src/types/skills.ts
// Sprint 9 — Skills Matrix & Certifications types

export interface SkillsMatrixCell {
  employeeId: string;
  employeeName: string;
  skillId: string;
  skillName: string;
  level: number | null;
  isValidated: boolean;
  hasGap: boolean;
}

export interface SkillsMatrixResponse {
  employees: { id: string; name: string; department: string }[];
  skills: { id: string; name: string; category: string | null }[];
  cells: SkillsMatrixCell[];
}

export interface SkillsMatrixFilters {
  departmentId?: string;
  skillCategory?: string;
}
