import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { moduleService } from "@/modules/billing/module.service";

/** Returns a Stripe Customer Portal URL for the signed-in doctor. */
export const POST = handle(async () => {
  const doctor = await requireDoctorApi();
  const url = await moduleService.billingPortalUrl(doctor.id);
  return ok({ url });
});
