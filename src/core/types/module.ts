import type { ModuleKey } from "./rbac";

/** A toggleable platform feature module. Admin controls availability & price. */
export interface ModuleDefinition {
  key: ModuleKey;
  name: string;
  description: string;
  priceMonthly: number; // add-on price when sold standalone
  status: "active" | "beta" | "coming_soon";
  /** Plans that include this module by default. */
  includedInPlans: string[];
}

/** Per-doctor module access state (admin can override plan defaults). */
export interface DoctorModuleAccess {
  doctorId: string;
  moduleKey: ModuleKey;
  enabled: boolean;
}
