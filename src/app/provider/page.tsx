import Link from "next/link";
import { CalendarDays, DollarSign, Eye, Briefcase, TrendingUp, ExternalLink } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { money } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyTrendChart, WeekdayBars } from "@/components/analytics/report-charts";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function ProviderDashboard() {
  const doctorId = MOCK_CURRENT.doctorId;
  const [doctor, appts, services] = await Promise.all([
    repositories.doctors.getById(doctorId),
    repositories.appointments.listByDoctor(doctorId),
    repositories.services.listByDoctor(doctorId),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = appts.filter((a) => a.date >= todayStr && ["pending", "confirmed"].includes(a.status));
  const monthly = appts.length;
  const revenue = appts.filter((a) => a.status === "completed").reduce((s, a) => s + a.priceCents, 0);

  // Build 14-day trend + weekday distribution from appointments.
  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    daily.push({ date: key.slice(5), count: appts.filter((a) => a.date === key).length });
  }
  const weekday = DAY.map((day, i) => ({
    day,
    count: appts.filter((a) => new Date(a.date + "T00:00:00Z").getUTCDay() === i).length,
  }));

  const stats = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
    { label: "Bookings", value: monthly, icon: TrendingUp },
    { label: "Revenue", value: money(revenue), icon: DollarSign },
    { label: "Profile views", value: doctor?.profileViews ?? 0, icon: Eye },
    { label: "Active services", value: services.length, icon: Briefcase },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {doctor?.fullName.split(" ").slice(-1)[0]}
          </h1>
          <p className="text-muted-foreground">Here&apos;s your practice at a glance.</p>
        </div>
        {doctor && (
          <Button variant="outline" asChild>
            <Link href={`/doctor/${doctor.username}`} target="_blank">
              <ExternalLink className="h-4 w-4" /> View public profile
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-7 w-7 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment trends</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent><DailyTrendChart data={daily} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking analytics</CardTitle>
            <CardDescription>By weekday</CardDescription>
          </CardHeader>
          <CardContent><WeekdayBars data={weekday} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
