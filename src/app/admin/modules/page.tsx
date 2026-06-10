import { Boxes } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ModulePriceEditor } from "@/components/admin/module-price-editor";

const STATUS_VARIANT = { active: "success", beta: "warning", coming_soon: "muted" } as const;

export default async function AdminModulesPage() {
  const modules = await prisma.platformModule.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { selections: { where: { active: true } } } },
      priceHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Boxes className="h-6 w-6 text-primary" /> Modules &amp; pricing
        </h1>
        <p className="text-muted-foreground">
          Edit module prices live — every change is recorded in the price history.
          New totals apply to doctors&apos; future selections immediately.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active doctors</TableHead>
                <TableHead>Monthly price</TableHead>
                <TableHead>Last change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {m.name}
                      {m.isCore && <Badge variant="secondary">Core</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[m.status]} className="capitalize">
                      {m.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{m._count.selections}</TableCell>
                  <TableCell>
                    {m.isCore ? (
                      <span className="text-muted-foreground">Included free</span>
                    ) : (
                      <ModulePriceEditor moduleId={m.id} priceMonthlyCents={m.priceMonthlyCents} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.priceHistory[0]
                      ? `${(m.priceHistory[0].oldPriceCents / 100).toFixed(0)} → ${(m.priceHistory[0].newPriceCents / 100).toFixed(0)} on ${m.priceHistory[0].createdAt.toISOString().slice(0, 10)}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
