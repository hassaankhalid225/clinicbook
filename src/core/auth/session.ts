/**
 * Mock marketplace session. Stores the signed-in role in a cookie so portals
 * can guard by RBAC role and render the right "current user". Replace with a
 * real Supabase/JWT session in Phase 2 — the call sites won't change.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/core/types";

const COOKIE = "mb_role";

export async function getSessionRole(): Promise<Role | null> {
  const v = (await cookies()).get(COOKIE)?.value;
  return v === "doctor" || v === "client" || v === "admin" ? v : null;
}

export async function setSessionRole(role: Role): Promise<void> {
  (await cookies()).set(COOKIE, role, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/**
 * Guards a portal: redirects to login unless the session role is allowed.
 * Admins are allowed everywhere (support access). Returns the active role.
 */
export async function requireRole(allowed: Role[]): Promise<Role> {
  const role = await getSessionRole();
  if (!role || (!allowed.includes(role) && role !== "admin")) {
    redirect(`/auth/login?role=${allowed[0]}`);
  }
  return role;
}
