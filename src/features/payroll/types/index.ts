export type ComponentType = 'earning' | 'deduction' | 'employer_contribution';
export type CalculationType = 'fixed' | 'formula' | 'percentage_of_base';
export type CycleStatus =
  | 'draft' | 'processing' | 'computed'
  | 'approved' | 'disbursed' | 'reversed';
export type EntryStatus =
  | 'computed' | 'approved' | 'disbursed' | 'held' | 'reversed';

export interface SalaryComponent {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: ComponentType;
  calculationType: CalculationType;
  formula: string | null;
  isActive: boolean;
}

export interface StructureComponent {
  id: string;
  componentId: string;
  component: SalaryComponent;
  sortOrder: number;
  defaultValue: number;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  components: StructureComponent[];
}

export interface EmployeeSalary {
  id: string;
  employeeId: string;
  structureId: string;
  structure: SalaryStructure;
  ctc: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'draft' | 'approved';
  notes: string | null;
}

export interface PayrollCycle {
  id: string;
  companyId: string;
  month: number;
  year: number;
  status: CycleStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  runAt: string | null;
  approvedAt: string | null;
  disbursedAt: string | null;
}

export interface PayrollEntry {
  id: string;
  cycleId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  monthlyCTC: number;
  workingDays: number;
  presentDays: number;
  lopDays: number;
  grossEarnings: number;
  totalDeductions: number;
  netPayable: number;
  status: EntryStatus;
  payslipKey: string | null;
}

export interface PayrollEntryComponent {
  componentId: string;
  componentCode: string;
  componentName: string;
  type: ComponentType;
  amount: number;
}

export interface Payslip {
  id: string;
  entryId: string;
  employeeId: string;
  cycleId: string;
  month: number;
  year: number;
  netPayable: number;
  generatedAt: string;
  downloadUrl: string | null;
}

export interface ComponentOverride {
  componentId: string;
  defaultValue: number;
}
