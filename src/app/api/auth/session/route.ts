import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { setSessionRole, clearSession } from "@/core/auth/session";
import { homeForRole } from "@/core/utils/session";

/**
 * Marketplace session via a STABLE API route (not a server action).
 * Server-action IDs change every build and strand stale browser tabs with
 * "action not found" — a fixed URL never does. POST sets the role cookie,
 * DELETE clears it.
 */
const schema = z.object({ role: z.enum(["admin", "doctor", "client"]) });

export const POST = handle(async (req: NextRequest) => {
  const { role } = schema.parse(await req.json());
  await setSessionRole(role);
  return ok({ home: homeForRole(role) });
});

export const DELETE = handle(async () => {
  await clearSession();
  return ok({ ok: true });
});
