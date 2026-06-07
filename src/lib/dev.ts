/**
 * TEMPORARY developer auth bypass.
 *
 * When `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`, login requires no credentials —
 * clicking "Log in" jumps straight to the dashboard, the route guard is
 * disabled, and protected pages load as the seeded demo doctor.
 *
 * ⚠️  Set this back to "false" (or remove it from .env) before using real
 *     Supabase authentication / shipping to production.
 */
export const DEV_AUTH_BYPASS =
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

/** Seeded demo doctor id (Dr. Sarah Johnson) — see prisma/seed.ts. */
export const DEMO_DOCTOR_ID = "00000000-0000-4000-8000-000000000001";
