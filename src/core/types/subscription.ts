import type { ID, TenantScoped, Timestamps } from "./common";
import type { ModuleKey } from "./rbac";

export type PlanId = "free" | "professional" | "business" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  description: string;
  modules: ModuleKey[]; // modules unlocked by this plan
  limits: {
    services: number | null;
    monthlyBookings: number | null;
    providers: number | null;
  };
  highlighted?: boolean;
}

export interface Subscription extends TenantScoped, Timestamps {
  id: ID;
  doctorId: ID;
  planId: PlanId;
  status: "active" | "trialing" | "past_due" | "cancelled";
  renewsAt: string;
}
