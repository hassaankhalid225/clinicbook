import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reminderService } from "@/modules/notifications/reminder.service";

/**
 * Daily reminder cron. Schedule with Vercel Cron (vercel.json) or any scheduler:
 *   GET /api/cron/reminders  with  Authorization: Bearer $CRON_SECRET
 * If CRON_SECRET is unset, the endpoint is open (fine for local/dev).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const result = await reminderService.sendDueReminders();
  return NextResponse.json({ ok: true, ...result });
}
