import { notFound } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { receiptService } from "@/modules/receipts/receipt.service";
import { money } from "@/core/utils/format";
import { PrintButton } from "@/components/receipts/print-button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await receiptService.getById(id);
  if (!receipt) notFound();

  const items = receipt.items as { label: string; amountCents: number }[];

  return (
    <div className="min-h-screen bg-muted/30 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-4 flex justify-end print:hidden">
          <PrintButton />
        </div>

        <div className="rounded-xl border bg-background p-8 shadow-sm print:rounded-none print:border-0 print:shadow-none">
          {/* Clinic header */}
          <div className="flex items-start justify-between border-b pb-6">
            <div>
              <p className="flex items-center gap-2 text-xl font-bold">
                <Stethoscope className="h-6 w-6 text-primary print:hidden" />
                {receipt.doctor.clinicName ?? receipt.doctor.fullName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {receipt.doctor.fullName}
                {receipt.doctor.specialty ? ` · ${receipt.doctor.specialty}` : ""}
              </p>
              {receipt.doctor.clinicAddress && (
                <p className="text-sm text-muted-foreground">{receipt.doctor.clinicAddress}</p>
              )}
              {receipt.doctor.phone && (
                <p className="text-sm text-muted-foreground">{receipt.doctor.phone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">RECEIPT</p>
              <p className="font-mono text-sm">{receipt.receiptNumber}</p>
              <p className="text-sm text-muted-foreground">
                {receipt.issuedAt.toISOString().slice(0, 10)}
              </p>
            </div>
          </div>

          {/* Patient + visit */}
          <div className="grid grid-cols-2 gap-4 border-b py-5 text-sm">
            <div>
              <p className="text-muted-foreground">Patient</p>
              <p className="font-medium">{receipt.patientName}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Visit</p>
              <p className="font-medium">
                {receipt.appointment.appointmentDate.toISOString().slice(0, 10)} at{" "}
                {receipt.appointment.startTime}
                {receipt.appointment.isTelehealth ? " (Telehealth)" : ""}
              </p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full py-4 text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3">{it.label}</td>
                  <td className="py-3 text-right">{money(it.amountCents, receipt.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto mt-4 w-56 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{money(receipt.subtotalCents, receipt.currency)}</span>
            </div>
            {receipt.taxCents > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{money(receipt.taxCents, receipt.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span>{money(receipt.totalCents, receipt.currency)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium uppercase">{receipt.paymentStatus}</span>
            </div>
          </div>

          <div className="mt-10 flex items-end justify-between text-sm text-muted-foreground">
            <p>Thank you for your visit.</p>
            <div className="text-center">
              <div className="mb-1 w-40 border-b" />
              <p>Signature / Stamp</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground print:hidden">
          Generated by ClinicBook · {receipt.receiptNumber}
        </p>
      </div>
    </div>
  );
}
