import type { ID, TenantScoped, Timestamps } from "./common";

export interface Client extends TenantScoped, Timestamps {
  id: ID;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  favoriteDoctorIds: ID[];
  savedDoctorIds: ID[];
}
