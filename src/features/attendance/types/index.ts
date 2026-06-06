export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'on_leave';
export type AttendanceSource = 'web' | 'mobile' | 'biometric' | 'manual';
export type ExceptionType = 'late' | 'absent' | 'missing_punch';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  source: AttendanceSource;
  status: AttendanceStatus;
  totalMinutes: number | null;
  isCorrected: boolean;
}

export interface AttendanceException {
  employeeId: string;
  employeeName: string;
  date: string;
  type: ExceptionType;
  detail: string;
}

export interface AttendanceCorrectionPayload {
  clockInAt: string;
  clockOutAt: string;
  reason: string;
}
