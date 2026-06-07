/**
 * Mock session helper. In the UI-first phase there is no real auth for the
 * marketplace — we pin a "current user" per role so the portals render real
 * mock data. Replace with Supabase/RBAC-derived identity in Phase 2.
 */
import type { Role } from "@/core/types";

export const MOCK_CURRENT = {
  doctorId: "d-1", // Dr. Sarah Johnson
  clientId: "c-1", // Ayesha Khan
  adminName: "Platform Admin",
};

export function homeForRole(role: Role): string {
  return role === "admin" ? "/admin" : role === "doctor" ? "/provider" : "/client";
}
