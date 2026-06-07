"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Clock, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { money } from "@/core/utils/format";

interface ServiceLite {
  id: string;
  title: string;
  durationMin: number;
  priceCents: number;
  currency: string;
  consultationType: "online" | "offline" | "both";
}

interface Slot { time: string; available: boolean }

export function BookingWidget({
  doctorId,
  doctorName,
  services,
}: {
  doctorId: string;
  doctorName: string;
  services: ServiceLite[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState<{ date: string; time: string } | null>(null);

  const service = services.find((s) => s.id === serviceId);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function pickDate(d: Date | undefined) {
    setDate(d);
    setSlot(null);
    setSlots([]);
    if (!d) return;
    const ds = format(d, "yyyy-MM-dd");
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/doctors/${doctorId}/slots?date=${ds}`);
      const json = await res.json();
      setSlots(res.ok ? json.data.slots : []);
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!date || !slot || !service) return;
    setBooking(true);
    const ds = format(date, "yyyy-MM-dd");
    try {
      const res = await fetch("/api/marketplace/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          serviceId,
          date: ds,
          startTime: slot,
          consultationType: service.consultationType === "online" ? "online" : "offline",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Booking failed");
      setDone({ date: ds, time: slot });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          <h3 className="text-xl font-bold">Appointment requested!</h3>
          <p className="text-muted-foreground">
            Your booking with {doctorName} for
            <br />
            <span className="font-semibold text-foreground">{done.date} at {done.time}</span>
            <br />
            is pending confirmation.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/client">My appointments</Link></Button>
            <Button asChild><Link href="/doctors">Book another</Link></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Service + date */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">1. Choose a service</p>
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary",
                  serviceId === s.id && "border-primary bg-primary/5",
                )}
              >
                <span>
                  <span className="font-medium">{s.title}</span>
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{s.durationMin}m
                  </span>
                </span>
                <span className="font-medium">{money(s.priceCents, s.currency)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">2. Pick a date</p>
          <div className="rounded-lg border">
            <Calendar mode="single" selected={date} onSelect={pickDate} disabled={{ before: new Date() }} />
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" /> Times shown in your timezone ({tz})
          </p>
        </div>
      </div>

      {/* Slots + confirm */}
      <div className="space-y-4">
        <p className="text-sm font-medium">3. Pick a time</p>
        {!date ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Select a date to see times.</CardContent></Card>
        ) : loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.filter((s) => s.available).length === 0 && (
                <p className="col-span-full py-4 text-sm text-muted-foreground">No open slots that day.</p>
              )}
              {slots.filter((s) => s.available).map((s) => (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => setSlot(s.time)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5",
                    slot === s.time && "border-primary bg-primary/10 font-medium",
                  )}
                >
                  {s.time}
                </button>
              ))}
            </div>
            {slot && service && (
              <Card className="border-primary/40">
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm">
                    <span className="font-semibold">{service.title}</span> with {doctorName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(date, "EEEE, MMM d")} at {slot} · {money(service.priceCents, service.currency)}
                  </p>
                  <Button className="w-full" onClick={confirm} disabled={booking}>
                    {booking ? "Booking…" : "Confirm booking"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
