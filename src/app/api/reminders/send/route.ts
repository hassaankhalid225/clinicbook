import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { reminderService } from "@/modules/notifications/reminder.service";

/** Doctor manually sends tomorrow's reminders for their own appointments. */
export const POST = handle(async () => {
  const doctor = await requireDoctorApi();
  return ok(await reminderService.sendDueReminders(doctor.id));
});
