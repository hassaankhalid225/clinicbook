import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { receiptService } from "@/modules/receipts/receipt.service";
import { money } from "@/core/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function ReceiptsPage() {
  const doctor = await requireDoctor();
  const receipts = await receiptService.listForDoctor(doctor.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Receipts</h1>
        <p className="text-muted-foreground">
          Every receipt you&apos;ve issued — open to print or re-share.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {receipts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <ReceiptText className="h-10 w-10 opacity-40" />
              <p>No receipts yet. Generate one from a completed appointment.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.receiptNumber}</TableCell>
                    <TableCell>{r.patientName}</TableCell>
                    <TableCell>{money(r.totalCents, r.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={r.paymentStatus === "paid" ? "success" : "muted"} className="uppercase">
                        {r.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.issuedAt.toISOString().slice(0, 10)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/receipt/${r.id}`} target="_blank">Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
