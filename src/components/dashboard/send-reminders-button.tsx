"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SendRemindersButton() {
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const res = await fetch("/api/reminders/send", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      const { sent, skipped, candidates } = json.data;
      toast.success(
        candidates === 0
          ? "No appointments tomorrow to remind."
          : `Sent ${sent} reminder${sent === 1 ? "" : "s"}${skipped ? `, ${skipped} already sent` : ""}.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={send} disabled={busy}>
      <BellRing className="h-4 w-4" /> {busy ? "Sending…" : "Send tomorrow's reminders"}
    </Button>
  );
}
