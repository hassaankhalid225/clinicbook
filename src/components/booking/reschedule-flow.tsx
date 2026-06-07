"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Props {
  token: string;
  doctorSlug: string;
  doctorName: string;
  currentDate: string;
  currentTime: string;
}

export function RescheduleFlow({
  token,
  doctorSlug,
  doctorName,
  currentDate,
  currentTime,
}: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ date: string; time: string } | null>(null);

  async function pickDate(d: Date | undefined) {
    setDate(d);
    setSlots([]);
    if (!d) return;
    const ds = format(d, "yyyy-MM-dd");
    setLoading(true);
    try {
      const res = await fetch(`/api/book/${doctorSlug}/slots?date=${ds}`);
      const json = await res.json();
      setSlots(res.ok ? json.data.slots : []);
    } finally {
      setLoading(false);
    }
  }

  async function choose(time: string) {
    if (!date) return;
    setSaving(true);
    const ds = format(date, "yyyy-MM-dd");
    try {
      const res = await fetch(`/api/book/reschedule/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: ds, time }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not reschedule");
      setDone({ date: ds, time });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reschedule");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h2 className="text-xl font-bold">Rescheduled!</h2>
        <p className="text-muted-foreground">
          Your appointment with {doctorName} is now
          <br />
          <span className="font-semibold text-foreground">
            {done.date} at {done.time}
          </span>
        </p>
        <Button asChild variant="outline">
          <Link href="/">Done</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3 text-sm">
        Current: <span className="font-semibold">{currentDate} at {currentTime}</span>{" "}
        with {doctorName}
      </div>
      <h3 className="flex items-center gap-2 font-semibold">
        <CalendarClock className="h-4 w-4 text-primary" /> Pick a new date
      </h3>
      <div className="rounded-lg border">
        <Calendar
          mode="single"
          selected={date}
          onSelect={pickDate}
          disabled={{ before: new Date() }}
        />
      </div>
      {date && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {format(date, "EEEE, MMM d")}
          </p>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : slots.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No open slots that day.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={saving}
                  onClick={() => choose(s)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50",
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
  );
}
