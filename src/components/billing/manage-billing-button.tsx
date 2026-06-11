"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Opens the Stripe Customer Portal (manage card, invoices, cancel). */
export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not open portal");
      window.location.href = json.data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open billing portal");
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={open} disabled={busy}>
      <CreditCard className="h-4 w-4" /> {busy ? "Opening…" : "Manage billing"}
    </Button>
  );
}
