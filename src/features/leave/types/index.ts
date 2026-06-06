export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type AccrualType = 'monthly' | 'annual' | 'none';
export type HolidayType = 'public' | 'optional' | 'restricted';
export type HalfDay = 'full' | 'first_half' | 'second_half';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  accrualType: AccrualType;
  accrualAmount: number;
  maxCarryForward: number;
  maxBalance: number;
  isPaid: boolean;
  isActive: boolean;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitled: number;
  used: number;
  carriedForward: number;
  closing: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  reason: string | null;
  rejectionReason: string | null;
  createdAt: string;
  departmentName?: string;
}

export interface Holiday {
  id: string;
  calendarId: string;
  name: string;
  date: string;
  type: HolidayType;
}

export interface HolidayCalendar {
  id: string;
  name: string;
  year: number;
  isDefault: boolean;
  holidays: Holiday[];
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  halfDay: HalfDay;
  reason?: string;
  overrideCapacity?: boolean;
}

export interface LeaveRequestListQuery {
  status?: string;
  page?: number;
  pageSize?: number;
  managerId?: string;
}

export interface LeaveRequestListResponse {
  data: LeaveRequest[];
  total: number;
  page: number;
  pageSize: number;
}
