import { cache } from "react";
import { redirect } from "next/navigation";
import type { Doctor } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/errors";
import { isSupabaseConfigured } from "@/lib/env";
import { DEV_AUTH_BYPASS, DEMO_DOCTOR_ID } from "@/lib/dev";

/**
 * Returns the authenticated Supabase user, or null. Cached per-request so
 * multiple callers in one render don't re-hit Supabase.
 */
export const getAuthUser = cache(async () => {
  // Without Supabase configured there can be no session; treat as logged out
  // so protected pages redirect to /login instead of throwing.
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Returns the Doctor row for the current session, or null when unauthenticated
 * or when no doctor profile exists yet.
 */
export const getCurrentDoctor = cache(async (): Promise<Doctor | null> => {
  // TEMP dev bypass: act as the seeded demo doctor with no real session.
  if (DEV_AUTH_BYPASS) {
    return (
      (await prisma.doctor.findUnique({ where: { id: DEMO_DOCTOR_ID } })) ??
      (await prisma.doctor.findFirst())
    );
  }

  const user = await getAuthUser();
  if (!user) return null;
  return prisma.doctor.findUnique({ where: { id: user.id } });
});

/**
 * Like {@link getCurrentDoctor} but redirects to /login when there is no
 * authenticated doctor. Use in protected Server Components.
 */
export async function requireDoctor(): Promise<Doctor> {
  const doctor = await getCurrentDoctor();
  if (!doctor) redirect("/login");
  return doctor;
}

/**
 * Like {@link requireDoctor} but throws {@link UnauthorizedError} instead of
 * redirecting. Use in API route handlers (wrapped by `handle`).
 */
export async function requireDoctorApi(): Promise<Doctor> {
  const doctor = await getCurrentDoctor();
  if (!doctor) throw new UnauthorizedError();
  return doctor;
}
