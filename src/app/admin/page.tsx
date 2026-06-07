import { Users, Stethoscope, CalendarCheck, DollarSign } from "lucide-react";
import { repositories } from "@/core/repositories";
import { money } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyTrendChart, StatusPie } from "@/components/analytics/report-charts";

export default async function AdminDashboard() {
  const [allDoctors, clients, totalAppts] = await Promise.all([
    repositories.doctors.listAll(),
    repositories.clients.list(),
    repositories.appointments.countAll(),
  ]);

  // Aggregate revenue across mock subscriptions (monthly).
  const subs = await Promise.all(allDoctors.map((d) => repositories.subscriptions.getForDoctor(d.id)));
  const plans = await repositories.subscriptions.plans();
  const planPrice = new Map(plans.map((p) => [p.id, p.priceMonthly]));
  const mrr = subs.reduce((s, sub) => s + (sub ? (planPrice.get(sub.planId) ?? 0) : 0), 0);

  const stats = [
    { label: "Total doctors", value: allDoctors.length, icon: Stethoscope },
    { label: "Total clients", value: clients.length, icon: Users },
    { label: "Active bookings", value: totalAppts, icon: CalendarCheck },
    { label: "MRR", value: money(mrr * 100), icon: DollarSign },
  ];

  // Mock platform growth + plan distribution.
  const growth = Array.from({ length: 12 }, (_, i) => ({
    date: `M${i + 1}`,
    count: Math.round(10 + i * 8 + (i % 3) * 4),
  }));
  const planDist = plans.map((p) => ({
    name: p.name,
    value: subs.filter((s) => s?.planId === p.id).length,
  }));

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
            <CardTitle>Plan distribution</CardTitle>
          </CardHeader>
          <CardContent><StatusPie data={planDist} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
