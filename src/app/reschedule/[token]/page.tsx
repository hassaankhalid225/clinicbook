import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { bookingService } from "@/modules/booking/booking.service";
import { RescheduleFlow } from "@/components/booking/reschedule-flow";

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const appt = await bookingService.getByToken(token);
  if (!appt) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {appt.status === "cancelled" ? (
            <p className="py-6 text-center text-muted-foreground">
              This appointment was cancelled and can&apos;t be rescheduled.
            </p>
          ) : (
            <RescheduleFlow
              token={token}
              doctorSlug={appt.doctorSlug}
              doctorName={appt.doctorName}
              currentDate={appt.date}
              currentTime={appt.time}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
