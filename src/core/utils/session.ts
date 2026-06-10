/**
 * Mock session helper. In the UI-first phase there is no real auth for the
 * marketplace — we pin a "current user" per role so the portals render real
 * mock data. Replace with Supabase/RBAC-derived identity in Phase 2.
 */
import type { Role } from "@/core/types";

const PRISMA = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "prisma";

export const MOCK_CURRENT = {
  // Demo doctor: seeded uuid when running on the real DB, mock id otherwise.
  doctorId: PRISMA ? "00000000-0000-4000-8000-000000000001" : "d-1",
  clientId: "c-1", // Ayesha Khan (client portal demo)
  adminName: "Platform Admin",
};

export function homeForRole(role: Role): string {
  return role === "admin" ? "/admin" : role === "doctor" ? "/provider" : "/client";
}
