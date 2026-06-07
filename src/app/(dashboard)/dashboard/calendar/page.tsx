import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { formatDateOnly, parseDateOnly } from "@/lib/datetime";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // back to Sunday
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-sky-100 text-sky-900 border-sky-200",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200 line-through",
  no_show: "bg-red-100 text-red-900 border-red-200",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const doctor = await requireDoctor();
  const { start } = await searchParams;

  const base = start ? parseDateOnly(start) : new Date();
  const weekStart = startOfWeek(base);
  const weekEnd = addDays(weekStart, 6);
  const todayStr = formatDateOnly(new Date());

  const appointments = await appointmentService.list(doctor.id, {
    from: formatDateOnly(weekStart),
    to: formatDateOnly(weekEnd),
  });

  // Group by date string.
  const byDay = new Map<string, typeof appointments>();
  for (const a of appointments) {
    const key = formatDateOnly(a.appointmentDate);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(a);
  }

  const prevWeek = formatDateOnly(addDays(weekStart, -7));
  const nextWeek = formatDateOnly(addDays(weekStart, 7));
  const monthLabel = weekStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/calendar?start=${prevWeek}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/calendar">Today</Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/calendar?start=${nextWeek}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i);
          const key = formatDateOnly(day);
          const items = (byDay.get(key) ?? []).filter(
            (a) => a.status !== "cancelled",
          );
          const isToday = key === todayStr;
          return (
            <Card key={key} className={cn(isToday && "border-primary")}>
              <CardContent className="p-3">
                <div className="mb-2 text-center">
                  <div className="text-xs text-muted-foreground">
                    {DAY_NAMES[day.getUTCDay()]}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold",
                      isToday && "text-primary",
                    )}
                  >
                    {day.getUTCDate()}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items.length === 0 ? (
                    <p className="py-2 text-center text-xs text-muted-foreground/60">
                      —
                    </p>
                  ) : (
                    items.map((a) => (
                      <div
                        key={a.id}
                        className={cn(
                          "rounded border px-2 py-1 text-xs",
                          STATUS_STYLES[a.status],
                        )}
                      >
                        <div className="font-semibold">{a.startTime}</div>
                        <div className="truncate">{a.patient.fullName}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
