import type { ID, TenantScoped, Timestamps } from "./common";

export interface Review extends TenantScoped, Timestamps {
  id: ID;
  doctorId: ID;
  clientId: ID;
  clientName: string;
  clientAvatarUrl?: string;
  rating: number; // 1-5
  comment: string;
  reply?: string;
  repliedAt?: string;
}

export interface CreateReviewInput {
  tenantId: ID;
  doctorId: ID;
  clientId: ID;
  clientName: string;
  rating: number;
  comment: string;
}
