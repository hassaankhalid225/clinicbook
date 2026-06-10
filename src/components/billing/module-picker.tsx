"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/core/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PickerModule {
  id: string;
  key: string;
  name: string;
  description: string;
  priceMonthlyCents: number;
  isCore: boolean;
  status: "active" | "beta" | "coming_soon";
  selected: boolean;
}

export function ModulePicker({
  modules,
  subscriptionActive,
}: {
  modules: PickerModule[];
  subscriptionActive: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(modules.filter((m) => m.selected).map((m) => m.id)),
  );
  const [busy, setBusy] = useState(false);

  // Live price accumulation — recomputed on every toggle.
  const totalCents = useMemo(
    () =>
      modules
        .filter((m) => selected.has(m.id) && !m.isCore)
        .reduce((s, m) => s + m.priceMonthlyCents, 0),
    [modules, selected],
  );

  function toggle(m: PickerModule) {
    if (m.isCore || m.status === "coming_soon") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(m.id)) next.delete(m.id);
      else next.add(m.id);
      return next;
    });
  }

  async function checkout() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds: [...selected] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Checkout failed");
      window.location.href = json.data.url; // Stripe Checkout or instant success
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  async function quickToggle(m: PickerModule, active: boolean) {
    // Post-subscription select/deselect (updates the plan immediately).
    try {
      const res = await fetch("/api/billing/modules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleKey: m.key, active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Update failed");
      toast.success(
        `${m.name} ${active ? "added" : "removed"} — new total ${money(json.data.totalMonthlyCents)}/mo`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((m) => {
          const isSelected = m.isCore || selected.has(m.id);
          const comingSoon = m.status === "coming_soon";
          return (
            <button
              key={m.id}
              type="button"
              disabled={comingSoon}
              onClick={() =>
                subscriptionActive && !m.isCore
                  ? quickToggle(m, !isSelected)
                  : toggle(m)
              }
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                isSelected && !comingSoon
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "hover:border-primary/50",
                comingSoon && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <p className="font-semibold">{m.name}</p>
                  {m.isCore && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" /> Core
                    </Badge>
                  )}
                  {m.status === "beta" && <Badge variant="warning">Beta</Badge>}
                  {comingSoon && <Badge variant="muted">Coming soon</Badge>}
                </div>
                <span className="shrink-0 font-semibold">
                  {m.priceMonthlyCents === 0 ? "Free" : `${money(m.priceMonthlyCents)}/mo`}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
            </button>
          );
        })}
      </div>

      {/* Sticky live total bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
        <div className="container flex h-20 items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Your plan total</p>
            <p className="text-2xl font-bold">
              {money(totalCents)}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          {!subscriptionActive ? (
            <Button size="lg" onClick={checkout} disabled={busy} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {busy ? "Redirecting…" : totalCents > 0 ? "Continue to payment" : "Activate free plan"}
            </Button>
          ) : (
            <Badge variant="success" className="px-3 py-1.5 text-sm">
              Subscription active — click modules to add/remove
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
