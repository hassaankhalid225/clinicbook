import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { availabilityService } from "@/modules/availability/availability.service";
import { upsertAvailabilitySchema } from "@/modules/availability/availability.schema";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  const rules = await availabilityService.listRules(doctor.id);
  return ok(rules);
});

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const input = upsertAvailabilitySchema.parse(await req.json());
  const rule = await availabilityService.upsertRule(doctor.id, input);
  return ok(rule, 201);
});
