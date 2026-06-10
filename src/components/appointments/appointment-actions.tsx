"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CalendarX, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import type { AppointmentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

function ReceiptButton({ appointmentId }: { appointmentId: string }) {
  const [busy, setBusy] = useState(false);
  async function open() {
    setBusy(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not create receipt");
      window.open(`/receipt/${json.data.id}`, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create receipt");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="outline" size="sm" disabled={busy} onClick={open}>
      <ReceiptText className="h-4 w-4" /> Receipt
    </Button>
  );
}

interface Props {
  appointmentId: string;
  status: AppointmentStatus;
}

/** Inline status controls for an appointment row. */
export function AppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<AppointmentStatus | null>(null);

  async function update(next: AppointmentStatus) {
    setPending(next);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Update failed");
      }
      toast.success(`Marked as ${next.replace("_", "-")}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPending(null);
    }
  }

  if (status === "cancelled" || status === "completed" || status === "no_show") {
    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {status === "completed" && <ReceiptButton appointmentId={appointmentId} />}
        <Button
          variant="ghost"
          size="sm"
          disabled={pending !== null}
          onClick={() => update("scheduled")}
        >
          Reopen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <ReceiptButton appointmentId={appointmentId} />
      <Button
        variant="outline"
        size="sm"
        disabled={pending !== null}
        onClick={() => update("completed")}
      >
        <Check className="h-4 w-4" /> Complete
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pending !== null}
        onClick={() => update("no_show")}
      >
        <CalendarX className="h-4 w-4" /> No-show
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending !== null}
        onClick={() => update("cancelled")}
      >
        <X className="h-4 w-4" /> Cancel
      </Button>
    </div>
  );
}
