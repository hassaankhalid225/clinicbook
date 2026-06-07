/** Shared primitive types used across the marketplace domain. */

export type ID = string;

/** Every persisted entity carries a tenant id for multi-tenant isolation. */
export interface TenantScoped {
  tenantId: ID;
}

export interface Timestamps {
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ConsultationType = "online" | "offline" | "both";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address {
  line1?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  geo?: GeoPoint;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
