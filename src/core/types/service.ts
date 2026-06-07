import type { ConsultationType, ID, TenantScoped, Timestamps } from "./common";

export interface Service extends TenantScoped, Timestamps {
  id: ID;
  doctorId: ID;
  title: string;
  description: string;
  durationMin: number;
  priceCents: number;
  currency: string;
  category: string;
  consultationType: ConsultationType;
  location?: string;
  isActive: boolean;
}
