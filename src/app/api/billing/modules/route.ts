import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { moduleService } from "@/modules/billing/module.service";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await moduleService.summaryForDoctor(doctor.id));
});

const checkoutSchema = z.object({ moduleIds: z.array(z.string()).max(50) });

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const { moduleIds } = checkoutSchema.parse(await req.json());
  const result = await moduleService.startCheckout(doctor.id, doctor.email, moduleIds);
  return ok(result);
});
