"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Trash2, CheckCircle2, Receipt, Search } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/core/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  priceCents: number;
}
type Cart = Record<string, { product: Product; qty: number }>;

export function PosTerminal({
  slug,
  clinicName,
  products,
}: {
  slug: string;
  clinicName: string;
  products: Product[];
}) {
  const [cart, setCart] = useState<Cart>({});
  const [query, setQuery] = useState("");
  const [patientName, setPatientName] = useState("");
  const [discount, setDiscount] = useState(0); // dollars
  const [method, setMethod] = useState<"cash" | "card" | "online">("cash");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ saleNumber: string; total: number; id: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, query]);

  const lines = Object.values(cart);
  const subtotalCents = lines.reduce((s, l) => s + l.product.priceCents * l.qty, 0);
  const discountCents = Math.min(Math.round(discount * 100), subtotalCents);
  const totalCents = subtotalCents - discountCents;

  function add(p: Product) {
    setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty ?? 0) + 1 } }));
  }
  function setQty(id: string, qty: number) {
    setCart((c) => {
      if (qty <= 0) {
        const { [id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: { ...c[id], qty } };
    });
  }

  async function checkout() {
    if (lines.length === 0) { toast.error("Cart is empty"); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/pos/${slug}/sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ name: l.product.name, priceCents: l.product.priceCents, quantity: l.qty })),
          patientName: patientName || undefined,
          discountCents,
          paymentMethod: method,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Checkout failed");
      setDone({ saleNumber: json.data.saleNumber, total: json.data.totalCents, id: json.data.id });
      setCart({});
      setPatientName("");
      setDiscount(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h2 className="text-2xl font-bold">Sale complete</h2>
        <p className="text-muted-foreground">
          {done.saleNumber} · <span className="font-semibold text-foreground">{money(done.total)}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/pos-receipt/${done.id}`} target="_blank" rel="noopener noreferrer">
              <Receipt className="h-4 w-4" /> Print invoice
            </a>
          </Button>
          <Button onClick={() => setDone(null)}>New sale</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Catalog */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No products.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p)}
                className="rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="font-medium leading-tight">{p.name}</p>
                <p className="mt-1 font-semibold">{money(p.priceCents)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      <Card className="h-fit lg:sticky lg:top-4">
        <CardContent className="space-y-3 p-4">
          <p className="font-semibold">Cart {lines.length > 0 && <Badge variant="secondary">{lines.length}</Badge>}</p>
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Tap products to add them.</p>
          ) : (
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.product.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.product.name}</p>
                    <p className="text-muted-foreground">{money(l.product.priceCents)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(l.product.id, l.qty - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{l.qty}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(l.product.id, l.qty + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setQty(l.product.id, 0)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t pt-3">
            <Input placeholder="Patient name (optional)" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Discount $</span>
              <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="h-9" />
            </div>
            <div className="flex gap-1.5">
              {(["cash", "card", "online"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex-1 rounded-md border py-1.5 text-sm capitalize transition-colors",
                    method === m ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(subtotalCents)}</span></div>
            {discountCents > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>−{money(discountCents)}</span></div>}
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(totalCents)}</span></div>
          </div>

          <Button className="w-full" size="lg" onClick={checkout} disabled={busy || lines.length === 0}>
            {busy ? "Processing…" : `Charge ${money(totalCents)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
