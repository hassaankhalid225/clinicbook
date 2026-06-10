"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PayButton({
  token,
  stripeMode,
}: {
  token: string;
  stripeMode: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      const res = await fetch(`/api/billing/booking/${token}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Payment failed");
      window.location.href = json.data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={pay} disabled={busy}>
        <CreditCard className="h-4 w-4" />
        {busy ? "Redirecting…" : stripeMode ? "Pay with card" : "Pay now (test mode)"}
      </Button>
      {!stripeMode && (
        <p className="text-center text-xs text-muted-foreground">
          Stripe keys not configured — payment will be simulated.
        </p>
      )}
    </div>
  );
}
