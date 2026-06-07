import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { listAppointmentsSchema } from "@/modules/appointments/appointment.schema";

export const GET = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  const sp = req.nextUrl.searchParams;
  const filter = listAppointmentsSchema.parse({
    status: sp.get("status") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
  return ok(await appointmentService.list(doctor.id, filter));
});
