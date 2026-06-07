"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BlockItem {
  id: string;
  blockedDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

export function BlockedDates({ initial }: { initial: BlockItem[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!date) {
      toast.error("Pick a date to block");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/doctor/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedDate: date, reason: reason || null }),
      });
      if (!res.ok) throw new Error("Could not add block");
      toast.success("Date blocked");
      setDate("");
      setReason("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add block");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/doctor/block/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove");
      toast.success("Block removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="sm:w-48"
        />
        <Input
          placeholder="Reason (optional) — e.g. Public holiday"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button onClick={add} disabled={busy} className="shrink-0">
          Block date
        </Button>
      </div>

      {initial.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blocked dates.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {initial.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <div>
                <span className="font-medium">{b.blockedDate}</span>
                {b.startTime && b.endTime ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {b.startTime}–{b.endTime}
                  </span>
                ) : (
                  <span className="text-muted-foreground"> · Full day</span>
                )}
                {b.reason && (
                  <span className="text-muted-foreground"> · {b.reason}</span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(b.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
