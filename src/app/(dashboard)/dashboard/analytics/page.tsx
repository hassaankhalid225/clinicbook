import { requireDoctor } from "@/lib/auth";
import { analyticsService } from "@/modules/analytics/analytics.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DailyTrendChart,
  StatusPie,
  WeekdayBars,
  HourBars,
} from "@/components/analytics/report-charts";

export default async function AnalyticsPage() {
  const doctor = await requireDoctor();
  const [summary, reports] = await Promise.all([
    analyticsService.summary(doctor.id),
    analyticsService.reports(doctor.id, 30),
  ]);

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: doctor.currency || "USD",
    maximumFractionDigits: 0,
  });

  const kpis = [
    { label: "Bookings (30d)", value: reports.total },
    { label: "Completed", value: summary.completed },
    { label: "No-show rate", value: summary.noShowRate },
    { label: "Revenue (30d)", value: currency.format(reports.revenueCents / 100) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Your last 30 days at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings trend</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyTrendChart data={reports.daily} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPie data={reports.status} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Busiest weekdays</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekdayBars data={reports.weekday} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Busiest hours</CardTitle>
          </CardHeader>
          <CardContent>
            <HourBars data={reports.byHour} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
