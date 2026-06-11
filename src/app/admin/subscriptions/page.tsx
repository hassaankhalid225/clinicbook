import { DollarSign, Users, Boxes } from "lucide-react";
import { adminBillingService } from "@/modules/billing/admin-stats.service";
import { money } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "success" | "info" | "warning" | "muted"> = {
  active: "success",
  incomplete: "warning",
  past_due: "warning",
  cancelled: "muted",
};

export default async function AdminSubscriptionsPage() {
  const { subs, activeCount, mrrCents, moduleStats } = await adminBillingService.overview();

  const kpis = [
    { label: "Platform MRR", value: money(mrrCents), icon: DollarSign },
    { label: "Active subscriptions", value: activeCount, icon: Users },
    { label: "Paid modules sold", value: moduleStats.filter((m) => !m.isCore).reduce((s, m) => s + m.doctors, 0), icon: Boxes },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions &amp; revenue</h1>
        <p className="text-muted-foreground">
          Module-based recurring revenue across all tenants — live from the database.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-2xl font-bold">{k.value}</p>
              </div>
              <k.icon className="h-7 w-7 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Module adoption &amp; revenue</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moduleStats.map((m) => (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium">
                      {m.name} {m.isCore && <Badge variant="secondary">Core</Badge>}
                    </TableCell>
                    <TableCell>{m.isCore ? "Free" : `${money(m.priceMonthlyCents)}/mo`}</TableCell>
                    <TableCell>{m.doctors}</TableCell>
                    <TableCell className="text-right">{money(m.monthlyRevenueCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tenant subscriptions</CardTitle></CardHeader>
          <CardContent>
            {subs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No subscriptions yet. Doctors compose a plan at sign-up.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.doctor.fullName}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[s.status] ?? "muted"} className="capitalize">
                          {s.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{s.provider}</TableCell>
                      <TableCell className="text-right">{money(s.totalMonthlyCents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
