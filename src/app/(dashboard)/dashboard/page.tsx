import { CalendarCheck, TrendingDown, Users, Clock, Video } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { env } from "@/lib/env";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { analyticsService } from "@/modules/analytics/analytics.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CopyLink } from "@/components/dashboard/copy-link";
import { StatusBadge } from "@/components/appointments/status-badge";
import { AppointmentActions } from "@/components/appointments/appointment-actions";
import { RiskBadge } from "@/components/appointments/risk-badge";
import { SendRemindersButton } from "@/components/dashboard/send-reminders-button";
import { noShowRisk } from "@/modules/analytics/risk.service";

export default async function DashboardHome() {
  const doctor = await requireDoctor();
  const [today, analytics] = await Promise.all([
    appointmentService.listToday(doctor.id),
    analyticsService.summary(doctor.id),
  ]);
  const bookingUrl = `${env.appUrl}/book/${doctor.slug}`;

  // No-show risk for today's still-scheduled visits.
  const riskById = new Map(
    await Promise.all(
      today.appointments
        .filter((a) => a.status === "scheduled")
        .map(async (a) => [a.id, await noShowRisk(a.patientId, a)] as const),
    ),
  );

  const stats = [
    {
      label: "Bookings this month",
      value: analytics.totalBookings,
      icon: CalendarCheck,
    },
    { label: "No-show rate", value: analytics.noShowRate, icon: TrendingDown },
    {
      label: "Busiest day",
      value: analytics.busiestDay ?? "—",
      icon: Users,
    },
    {
      label: "Avg / day",
      value: analytics.avgBookingsPerDay,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {doctor.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what your schedule looks like today.
        </p>
      </div>

      {/* Booking link */}
      <Card>
        <CardHeader>
          <CardTitle>Your booking link</CardTitle>
          <CardDescription>
            Share this anywhere — patients book without an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CopyLink url={bookingUrl} />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-8 w-8 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Today — {today.date}</CardTitle>
              <CardDescription>
                {today.count} appointment{today.count === 1 ? "" : "s"}
              </CardDescription>
            </div>
            <SendRemindersButton />
          </div>
        </CardHeader>
        <CardContent>
          {today.appointments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No appointments today. Share your booking link to start filling
              your calendar.
            </p>
          ) : (
            <ul className="divide-y">
              {today.appointments.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 shrink-0 font-semibold">
                      {a.startTime}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{a.patient.fullName}</p>
                        {riskById.get(a.id) && (
                          <RiskBadge {...riskById.get(a.id)!} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {a.reason ?? "—"}
                        {a.isTelehealth && " · Telehealth"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.isTelehealth && a.videoRoomUrl && a.status === "scheduled" && (
                      <a
                        href={a.videoRoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-primary px-3 text-sm font-medium text-primary hover:bg-primary/5"
                      >
                        <Video className="h-4 w-4" /> Join
                      </a>
                    )}
                    <StatusBadge status={a.status} />
                    <AppointmentActions appointmentId={a.id} status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
