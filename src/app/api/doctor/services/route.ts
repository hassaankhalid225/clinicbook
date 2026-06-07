import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { serviceService } from "@/modules/services/service.service";
import { serviceSchema } from "@/modules/services/service.schema";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await serviceService.list(doctor.id));
});

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const input = serviceSchema.parse(await req.json());
  return ok(await serviceService.create(doctor.id, input), 201);
});
