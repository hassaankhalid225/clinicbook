import Link from "next/link";
import { Store, ExternalLink, DollarSign, Receipt, Lock } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { moduleService } from "@/modules/billing/module.service";
import { posService } from "@/modules/pos/pos.service";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { money, formatDate } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyLink } from "@/components/dashboard/copy-link";
import { ProductManager, type PosProductItem } from "@/components/pos/product-manager";

export default async function ProviderPosPage() {
  const doctorId = MOCK_CURRENT.doctorId;
  const [doctor, hasPos] = await Promise.all([
    prisma.doctor.findUnique({ where: { id: doctorId }, select: { slug: true } }),
    moduleService.hasModule(doctorId, "pos"),
  ]);

  // Gated: POS requires the module.
  if (!hasPos) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Lock className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-bold">POS module not active</h1>
        <p className="mt-2 text-muted-foreground">
          Run your clinic&apos;s front desk: sell consultations, lab tests,
          procedures, and pharmacy items with cart checkout and printed invoices.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/modules">Enable the POS module</Link>
        </Button>
      </div>
    );
  }

  const [products, stats, recent] = await Promise.all([
    posService.listProducts(doctorId),
    posService.todayStats(doctorId),
    posService.listSales(doctorId, 8),
  ]);
  const posUrl = `${env.appUrl}/doctor/${doctor?.slug}/pos`;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Store className="h-6 w-6 text-primary" /> POS setup
        </h1>
        <p className="text-muted-foreground">
          Your clinic point-of-sale — products, checkout, and daily takings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s sales</p>
              <p className="mt-1 text-2xl font-bold">{stats.count}</p>
            </div>
            <Receipt className="h-7 w-7 text-muted-foreground/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s revenue</p>
              <p className="mt-1 text-2xl font-bold">{money(stats.revenueCents)}</p>
            </div>
            <DollarSign className="h-7 w-7 text-muted-foreground/40" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your POS terminal link</CardTitle>
          <CardDescription>
            Open this on the front-desk computer or tablet to take payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyLink url={posUrl} />
          <Button asChild>
            <Link href={`/doctor/${doctor?.slug}/pos`} target="_blank">
              <ExternalLink className="h-4 w-4" /> Open POS terminal
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products &amp; catalog</CardTitle>
          <CardDescription>What can be sold at the terminal.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductManager
            initial={products.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              priceCents: p.priceCents,
              isActive: p.isActive,
            })) as PosProductItem[]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent sales</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    <span className="font-mono">{s.saleNumber}</span>
                    {s.patientName ? ` · ${s.patientName}` : ""}
                    <span className="text-muted-foreground"> · {formatDate(s.createdAt.toISOString())}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{s.paymentMethod}</Badge>
                    <span className="font-medium">{money(s.totalCents)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
