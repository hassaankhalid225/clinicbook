import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { registerSchema } from "@/modules/doctors/doctor.schema";
import { authService } from "@/modules/auth/auth.service";

export const POST = handle(async (req: NextRequest) => {
  const body = await req.json();
  const input = registerSchema.parse(body);
  const doctor = await authService.register(input);
  return ok(
    { id: doctor.id, email: doctor.email, slug: doctor.slug },
    201,
  );
});
