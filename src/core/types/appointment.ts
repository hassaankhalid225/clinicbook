import type { ID, TenantScoped, Timestamps } from "./common";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment extends TenantScoped, Timestamps {
  id: ID;
  doctorId: ID;
  clientId: ID;
  serviceId: ID;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:30"
  endTime: string;
  status: AppointmentStatus;
  consultationType: "online" | "offline";
  reason?: string;
  notes?: string;
  priceCents: number;
  // denormalized for convenient display
  doctorName?: string;
  clientName?: string;
  serviceTitle?: string;
}

export interface CreateAppointmentInput {
  tenantId: ID;
  doctorId: ID;
  clientId: ID;
  serviceId: ID;
  date: string;
  startTime: string;
  consultationType: "online" | "offline";
  reason?: string;
}
