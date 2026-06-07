import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { doctorService } from "@/modules/doctors/doctor.service";
import { AppError, ConflictError } from "@/lib/errors";
import type { RegisterInput } from "@/modules/doctors/doctor.schema";

/**
 * Registration flow:
 *  1. Create the Supabase auth user (email auto-confirmed for a frictionless MVP).
 *  2. Create the matching Doctor profile row keyed by the auth user id.
 * The client then signs in with the same credentials to establish a session.
 */
export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.doctor.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });

    if (error || !data.user) {
      throw new AppError(error?.message ?? "Could not create account", 400);
    }

    try {
      const doctor = await doctorService.create({
        id: data.user.id,
        email: input.email,
        fullName: input.fullName,
        specialty: input.specialty,
      });
      return doctor;
    } catch (err) {
      // Roll back the orphaned auth user if profile creation fails.
      await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
      throw err;
    }
  },
};
