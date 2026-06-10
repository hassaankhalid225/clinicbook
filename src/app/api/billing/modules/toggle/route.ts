import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { moduleService } from "@/modules/billing/module.service";

const schema = z.object({ moduleKey: z.string(), active: z.boolean() });

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const { moduleKey, active } = schema.parse(await req.json());
  return ok(await moduleService.toggleModule(doctor.id, moduleKey, active));
});
