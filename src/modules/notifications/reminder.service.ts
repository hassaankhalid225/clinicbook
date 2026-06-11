import { prisma } from "@/lib/prisma";
import { parseDateOnly, formatDateOnly } from "@/lib/datetime";
import { notificationService } from "./notification.service";

/**
 * 24-hour appointment reminders. Designed to be hit by a daily cron
 * (Vercel Cron / GitHub Action) at /api/cron/reminders, or triggered manually
 * from the dashboard. Idempotent per day: skips appointments that already have
 * a reminder logged.
 */
export const reminderService = {
  /** Sends reminders for tomorrow's scheduled appointments (optionally one doctor). */
  async sendDueReminders(doctorId?: string) {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const date = parseDateOnly(formatDateOnly(tomorrow));

    const appts = await prisma.appointment.findMany({
      where: {
        appointmentDate: date,
        status: "scheduled",
        ...(doctorId ? { doctorId } : {}),
      },
      include: { notifications: { where: { type: "reminder" } } },
    });

    let sent = 0;
    let skipped = 0;
    for (const a of appts) {
      if (a.notifications.length > 0) {
        skipped++;
        continue;
      }
      await notificationService.sendReminder(a.id).catch(() => {});
      sent++;
    }
    return { date: formatDateOnly(date), candidates: appts.length, sent, skipped };
  },
};
