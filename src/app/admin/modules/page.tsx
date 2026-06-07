import { Boxes } from "lucide-react";
import { repositories } from "@/core/repositories";
import { money } from "@/core/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT = { active: "success", beta: "warning", coming_soon: "muted" } as const;

export default async function AdminModulesPage() {
  const modules = await repositories.modules.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Boxes className="h-6 w-6 text-primary" /> Modules
        </h1>
        <p className="text-muted-foreground">
          Platform feature modules — status, pricing, and plan inclusion.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Add-on price</TableHead>
                <TableHead>Included in plans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((m) => (
                <TableRow key={m.key}>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[m.status]} className="capitalize">
                      {m.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.priceMonthly > 0 ? `${money(m.priceMonthly * 100)}/mo` : "Free"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.includedInPlans.map((p) => (
                        <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
                      ))}
                    </div>
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
