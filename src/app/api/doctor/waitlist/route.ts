import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { waitlistService } from "@/modules/waitlist/waitlist.service";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await waitlistService.list(doctor.id));
});
