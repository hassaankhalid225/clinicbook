import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { doctorService } from "@/modules/doctors/doctor.service";
import { updateDoctorSchema } from "@/modules/doctors/doctor.schema";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(doctor);
});

export const PUT = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const input = updateDoctorSchema.parse(await req.json());
  const updated = await doctorService.update(doctor.id, input);
  return ok(updated);
});
