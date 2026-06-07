import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { patientService } from "@/modules/patients/patient.service";

export const GET = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  return ok(await patientService.listForDoctor(doctor.id, q));
});
