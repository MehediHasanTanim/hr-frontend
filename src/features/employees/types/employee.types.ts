export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated";
export type EmployeeType = "full_time" | "part_time" | "contractor" | "intern";
export type Gender = "female" | "male" | "non_binary" | "prefer_not_to_say";
export type EmploymentHistoryEventType = "hired" | "promoted" | "transferred" | "terminated";
export type SortOrder = "asc" | "desc";

export interface EmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  email: string;
  workEmail?: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  jobTitle?: string;
  status: EmployeeStatus;
  employeeType: EmployeeType;
  location?: string;
  joiningDate: string;
  managerId?: string;
  managerName?: string;
}

export interface Employee extends EmployeeSummary {
  dateOfBirth?: string;
  gender?: Gender;
  nationalId?: string;
  passportNumber?: string;
  probationEndDate?: string;
  payGrade?: string;
  bankName?: string;
  branchName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  routingNumber?: string;
}

export interface EmployeeListQuery {
  search: string;
  departmentId: string;
  status: string;
  employeeType: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: SortOrder;
}

export interface EmployeeListResponse {
  data: EmployeeSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | "";
  nationalId: string;
  passportNumber: string;
  employeeNumber: string;
  employeeType: EmployeeType | "";
  status: EmployeeStatus | "";
  joiningDate: string;
  probationEndDate: string;
  workEmail: string;
  departmentId: string;
  jobTitle: string;
  payGrade: string;
  managerId: string;
  location: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface EmploymentHistoryRecord {
  id: string;
  eventType: EmploymentHistoryEventType;
  effectiveDate: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  remarks?: string;
}

export interface ImportJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  totalRows?: number;
  successfulRows?: number;
  failedRows?: number;
  errorReportUrl?: string;
  errors?: ImportRowError[];
}

export interface ImportRowError {
  rowNumber: number;
  field: string;
  message: string;
  rawValue?: string;
}
