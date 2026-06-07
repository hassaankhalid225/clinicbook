import { repositories } from "@/core/repositories";
import { money, formatDate } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT = { active: "success", trialing: "info", past_due: "warning", cancelled: "muted" } as const;

export default async function AdminSubscriptionsPage() {
  const [doctors, plans] = await Promise.all([
    repositories.doctors.listAll(),
    repositories.subscriptions.plans(),
  ]);
  const planPrice = new Map(plans.map((p) => [p.id, p.priceMonthly]));
  const rows = await Promise.all(
    doctors.map(async (d) => ({
      doctor: d,
      sub: await repositories.subscriptions.getForDoctor(d.id),
    })),
  );
  const mrr = rows.reduce((s, r) => s + (r.sub ? (planPrice.get(r.sub.planId) ?? 0) : 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Billing across all tenants.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {rows.filter((r) => r.sub?.planId === p.id).length}
              </p>
              <p className="text-xs text-muted-foreground">${p.priceMonthly}/mo each</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>MRR: {money(mrr * 100)}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead>Monthly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ doctor, sub }) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.fullName}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{sub?.planId ?? "—"}</Badge></TableCell>
                  <TableCell>
                    {sub && <Badge variant={STATUS_VARIANT[sub.status]} className="capitalize">{sub.status}</Badge>}
                  </TableCell>
                  <TableCell>{sub ? formatDate(sub.renewsAt) : "—"}</TableCell>
                  <TableCell>{money((planPrice.get(sub?.planId ?? "free") ?? 0) * 100)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
