import type { ID, TenantScoped } from "./common";

/** Recurring weekly availability for a doctor. */
export interface AvailabilityRule extends TenantScoped {
  id: ID;
  doctorId: ID;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDurationMin: number;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

/** One-off blocked date or holiday. */
export interface BlockedDate extends TenantScoped {
  id: ID;
  doctorId: ID;
  date: string; // YYYY-MM-DD
  startTime?: string; // null = full day
  endTime?: string;
  reason?: string;
  isHoliday: boolean;
}

export interface TimeSlot {
  time: string; // "09:30"
  available: boolean;
}
