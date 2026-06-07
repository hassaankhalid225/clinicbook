"use server";

import { redirect } from "next/navigation";
import type { Role } from "@/core/types";
import { setSessionRole, clearSession } from "@/core/auth/session";
import { homeForRole } from "@/core/utils/session";

/** Mock sign-in: set the role cookie and land on that role's home. */
export async function signInAs(role: Role) {
  await setSessionRole(role);
  redirect(homeForRole(role));
}

/** Sign out and return to the login screen. */
export async function signOut() {
  await clearSession();
  redirect("/auth/login");
}
