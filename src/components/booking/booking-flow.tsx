"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PublicDoctor {
  slug: string;
  fullName: string;
  clinicName: string | null;
}

export interface BookableService {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

type Step = "date" | "details" | "done";

interface Confirmation {
  date: string;
  time: string;
  cancelToken: string;
  isTelehealth: boolean;
  amountCents: number;
  videoUrl?: string | null;
}

export function BookingFlow({
  doctor,
  services = [],
}: {
  doctor: PublicDoctor;
  services?: BookableService[];
}) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [isTelehealth, setIsTelehealth] = useState(false);

  const dateStr = date ? format(date, "yyyy-MM-dd") : null;

  async function onPickDate(d: Date | undefined) {
    setDate(d);
    setSlot(null);
    setSlots([]);
    if (!d) return;
    const ds = format(d, "yyyy-MM-dd");
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/book/${doctor.slug}/slots?date=${ds}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not load slots");
      setSlots(json.data.slots);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load slots");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dateStr || !slot) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      date: dateStr,
      time: slot,
      serviceId,
      patientName: String(fd.get("patientName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      reason: String(fd.get("reason") ?? ""),
      isTelehealth,
    };
    try {
      const res = await fetch(`/api/book/${doctor.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Booking failed");
      setConfirmation({
        date: dateStr,
        time: slot,
        cancelToken: json.data.cancelToken,
        isTelehealth,
        amountCents: json.data.amountCents ?? 0,
        videoUrl: json.data.videoUrl,
      });
      setStep("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && confirmation) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h3 className="text-xl font-bold">You&apos;re booked!</h3>
        <p className="text-muted-foreground">
          Your appointment with {doctor.fullName} is confirmed for
          <br />
          <span className="font-semibold text-foreground">
            {confirmation.date} at {confirmation.time}
          </span>
        </p>
        {confirmation.isTelehealth && confirmation.videoUrl && (
          <a
            href={confirmation.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <Video className="h-4 w-4" /> Join video call
          </a>
        )}
        {confirmation.amountCents > 0 && (
          <a
            href={`/pay/${confirmation.cancelToken}`}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Pay now — ${(confirmation.amountCents / 100).toFixed(2)}
          </a>
        )}
        <p className="max-w-sm text-sm text-muted-foreground">
          A confirmation has been sent. Need to cancel? Use the link in your
          message, or{" "}
          <a
            href={`/cancel/${confirmation.cancelToken}`}
            className="text-primary underline"
          >
            cancel here
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Step 1: date + slots */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <CalendarClock className="h-4 w-4 text-primary" /> Pick a date
        </h3>
        <div className="rounded-lg border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onPickDate}
            disabled={{ before: new Date() }}
          />
        </div>

        {date && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">
              Available times — {format(date, "EEEE, MMM d")}
            </p>
            {loadingSlots ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
              </div>
            ) : slots.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No open slots that day. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSlot(s);
                      setStep("details");
                    }}
                    className={cn(
                      "rounded-md border px-2 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5",
                      slot === s && "border-primary bg-primary/10 font-medium",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: details */}
      <div>
        <h3 className="mb-3 font-semibold">Your details</h3>
        {!slot ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Select a date and time to continue.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              Booking{" "}
              <span className="font-semibold">
                {dateStr} at {slot}
              </span>
            </div>
            {services.length > 0 && (
              <div className="space-y-2">
                <Label>Service</Label>
                <div className="space-y-1.5">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(serviceId === s.id ? null : s.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:border-primary",
                        serviceId === s.id && "border-primary bg-primary/5 font-medium",
                      )}
                    >
                      <span>
                        {s.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {s.durationMin} min
                        </span>
                      </span>
                      <span>
                        {s.priceCents > 0
                          ? `$${(s.priceCents / 100).toFixed(2)}`
                          : "Free"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="patientName">Full name</Label>
              <Input id="patientName" name="patientName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (for SMS confirmation)</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for visit</Label>
              <Textarea id="reason" name="reason" required rows={3} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-primary" /> Telehealth (video)
                visit
              </div>
              <Switch
                checked={isTelehealth}
                onCheckedChange={setIsTelehealth}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm booking"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
