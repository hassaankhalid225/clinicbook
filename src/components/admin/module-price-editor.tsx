"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ModulePriceEditor({
  moduleId,
  priceMonthlyCents,
}: {
  moduleId: string;
  priceMonthlyCents: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState((priceMonthlyCents / 100).toFixed(2));
  const [busy, setBusy] = useState(false);

  async function save() {
    const cents = Math.round(parseFloat(value) * 100);
    if (Number.isNaN(cents) || cents < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceMonthlyCents: cents }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not update price");
      toast.success("Price updated (history recorded)");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update price");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">$</span>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-24"
        inputMode="decimal"
      />
      <span className="text-xs text-muted-foreground">/mo</span>
      <Button size="sm" variant="outline" onClick={save} disabled={busy}>
        Save
      </Button>
    </div>
  );
}
