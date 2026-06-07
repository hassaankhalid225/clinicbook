/** Role-Based Access Control: roles, permissions, and module access. */

export type Role = "admin" | "doctor" | "client";

/** Granular permissions checked across the app. */
export type Permission =
  // Doctor self-service
  | "doctor:profile:manage"
  | "doctor:services:manage"
  | "doctor:availability:manage"
  | "doctor:appointments:manage"
  | "doctor:reviews:reply"
  | "doctor:analytics:view"
  // Client
  | "client:appointments:manage"
  | "client:reviews:create"
  | "client:favorites:manage"
  // Admin
  | "admin:doctors:manage"
  | "admin:clients:manage"
  | "admin:subscriptions:manage"
  | "admin:modules:manage"
  | "admin:platform:view";

/** Feature modules that can be toggled per plan / per doctor. */
export type ModuleKey =
  | "calendar"
  | "booking"
  | "reviews"
  | "analytics"
  | "messaging"
  | "telemedicine"
  | "services"
  | "expertise";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "admin:doctors:manage",
    "admin:clients:manage",
    "admin:subscriptions:manage",
    "admin:modules:manage",
    "admin:platform:view",
    // admins can do everything doctors/clients can, for support
    "doctor:profile:manage",
    "doctor:services:manage",
    "doctor:availability:manage",
    "doctor:appointments:manage",
    "doctor:analytics:view",
  ],
  doctor: [
    "doctor:profile:manage",
    "doctor:services:manage",
    "doctor:availability:manage",
    "doctor:appointments:manage",
    "doctor:reviews:reply",
    "doctor:analytics:view",
  ],
  client: [
    "client:appointments:manage",
    "client:reviews:create",
    "client:favorites:manage",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Default landing path for each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  doctor: "/provider",
  client: "/client",
};
