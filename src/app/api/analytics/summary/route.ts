import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { analyticsService } from "@/modules/analytics/analytics.service";

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await analyticsService.summary(doctor.id));
});
