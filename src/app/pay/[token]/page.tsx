import { notFound } from "next/navigation";
import { CheckCircle2, Stethoscope } from "lucide-react";
import { paymentService } from "@/modules/billing/payment.service";
import { money } from "@/core/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayButton } from "@/components/booking/pay-button";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { token } = await params;
  const { status } = await searchParams;
  const summary = await paymentService.paySummary(token);
  if (!summary) notFound();

  const paid = summary.paymentStatus === "paid" || status === "success";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-8">
          <div className="flex items-center gap-2 font-bold">
            <Stethoscope className="h-6 w-6 text-primary" /> ClinicBook
          </div>

          {paid ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <h1 className="text-xl font-bold">Payment complete</h1>
              <p className="text-sm text-muted-foreground">
                Your appointment with {summary.doctorName} on {summary.date} at{" "}
                {summary.time} is paid. A receipt has been issued — you can also
                collect a printed copy at the clinic.
              </p>
              {summary.isTelehealth && summary.videoRoomUrl && (
                <a
                  href={summary.videoRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Join video call
                </a>
              )}
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold">Complete your payment</h1>
                <p className="text-sm text-muted-foreground">
                  Secure payment for your appointment.
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-4 text-sm">
                <Row label="Doctor" value={summary.doctorName} />
                {summary.clinicName && <Row label="Clinic" value={summary.clinicName} />}
                <Row label="Patient" value={summary.patientName} />
                <Row label="When" value={`${summary.date} at ${summary.time}`} />
                <Row label="Service" value={summary.serviceTitle} />
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{money(summary.amountCents, summary.currency)}</span>
                </div>
              </div>
              {summary.status === "cancelled" ? (
                <Badge variant="destructive">This appointment was cancelled.</Badge>
              ) : summary.amountCents <= 0 ? (
                <Badge variant="muted">Nothing to pay for this appointment.</Badge>
              ) : (
                <PayButton token={token} stripeMode={summary.stripeMode} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
