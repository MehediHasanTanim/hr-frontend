import type { Holiday, HolidayCalendar, HolidayType } from '@/features/leave/types';

export type { Holiday, HolidayCalendar, HolidayType };

export interface CreateHolidayCalendarPayload {
  name: string;
  year: number;
  isDefault: boolean;
}

export interface CreateHolidayPayload {
  date: string;
  name: string;
  type: HolidayType;
}

export interface UpdateHolidayPayload {
  date: string;
  name: string;
  type: HolidayType;
}
