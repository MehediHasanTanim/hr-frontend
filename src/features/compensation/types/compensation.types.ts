// src/features/compensation/types/compensation.types.ts
// Sprint 10 — Compensation & Bonus Types

export type CompensationCycleStatus =
  | "PLANNING"
  | "OPEN"
  | "APPROVAL"
  | "DISBURSED"
  | "CANCELLED";

export type AllocationStatus =
  | "PROPOSED"
  | "APPROVED"
  | "REJECTED"
  | "DISBURSED";

export interface CompStatement {
  employeeId: string;
  fiscalYear: string;
  guaranteedCash: {
    baseSalary: number;
    benefitsEmployerValue: number;
  };
  variableCash: {
    bonusDisbursedYTD: number;
  };
  equity: {
    vestedUnits: number;
    unvestedUnits: number;
    illustrativeUnrealizedValue: number | null;
  };
}

export interface CompensationCycle {
  id: string;
  name: string;
  fiscalYear: string;
  status: CompensationCycleStatus;
  totalBudget: number;
  allocatedTotal: number;
}

export interface EmployeeAllocation {
  employeeId: string;
  employeeName: string;
  targetPercent: number;
  recommendedAmount: number | null;
  proposedAmount: number | null;
  approvedAmount: number | null;
  status: AllocationStatus;
}

export interface ProposeAllocationDto {
  cycleId: string;
  employeeId: string;
  proposedAmount: number;
}

export interface ApproveAllocationDto {
  cycleId: string;
  employeeId: string;
  approvedAmount: number;
}
