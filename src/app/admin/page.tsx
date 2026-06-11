import { Users, Stethoscope, CalendarCheck, DollarSign } from "lucide-react";
import { repositories } from "@/core/repositories";
import { adminBillingService } from "@/modules/billing/admin-stats.service";
import { money } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyTrendChart, StatusPie } from "@/components/analytics/report-charts";

export default async function AdminDashboard() {
  const [allDoctors, clients, totalAppts, billing] = await Promise.all([
    repositories.doctors.listAll(),
    repositories.clients.list(),
    repositories.appointments.countAll(),
    adminBillingService.overview(),
  ]);

  const stats = [
    { label: "Total doctors", value: allDoctors.length, icon: Stethoscope },
    { label: "Total clients", value: clients.length, icon: Users },
    { label: "Active bookings", value: totalAppts, icon: CalendarCheck },
    { label: "MRR", value: money(billing.mrrCents), icon: DollarSign },
  ];

  // Platform growth (illustrative trend) + real module-revenue distribution.
  const growth = Array.from({ length: 12 }, (_, i) => ({
    date: `M${i + 1}`,
    count: Math.round(10 + i * 8 + (i % 3) * 4),
  }));
  const moduleDist = billing.moduleStats
    .filter((m) => !m.isCore && m.doctors > 0)
    .map((m) => ({ name: m.name, value: m.doctors }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform overview</h1>
        <p className="text-muted-foreground">Super-admin metrics across all tenants.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform growth</CardTitle>
            <CardDescription>New doctors per month (mock)</CardDescription>
          </CardHeader>
          <CardContent><DailyTrendChart data={growth} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Module adoption</CardTitle>
            <CardDescription>Paid modules by doctor count</CardDescription>
          </CardHeader>
          <CardContent><StatusPie data={moduleDist} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
