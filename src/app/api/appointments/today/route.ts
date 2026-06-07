import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await appointmentService.listToday(doctor.id));
});
