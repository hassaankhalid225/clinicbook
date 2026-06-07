import type { ID, Timestamps } from "./common";

/** A tenant is an isolated workspace. Each doctor (or clinic) is a tenant. */
export interface Tenant extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  ownerDoctorId?: ID;
  planId: string;
  status: "active" | "suspended" | "trial";
}
