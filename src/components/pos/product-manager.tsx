"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/core/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export interface PosProductItem {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  isActive: boolean;
}

const EMPTY: Partial<PosProductItem> = { name: "", category: "General", priceCents: 0, isActive: true };

export function ProductManager({ initial }: { initial: PosProductItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<PosProductItem> | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!editing?.name) { toast.error("Enter a name"); return; }
    setBusy(true);
    const body = {
      name: editing.name,
      category: editing.category || "General",
      priceCents: Math.round(Number(editing.priceCents) || 0),
      isActive: editing.isActive ?? true,
    };
    const isEdit = Boolean(editing.id);
    try {
      const res = await fetch(isEdit ? `/api/pos/products/${editing.id}` : "/api/pos/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not save");
      toast.success(isEdit ? "Product updated" : "Product added");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/pos/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete");
      toast.success("Product removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  // Group by category for a tidy catalog view.
  const byCat = initial.reduce<Record<string, PosProductItem[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing({ ...EMPTY }); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {initial.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
          No products yet. Add consultations, lab tests, procedures, or pharmacy items.
        </CardContent></Card>
      ) : (
        Object.entries(byCat).map(([cat, items]) => (
          <div key={cat}>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">{cat}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center justify-between gap-2 p-3">
                    <div>
                      <p className="font-medium">{p.name} {!p.isActive && <Badge variant="muted">Hidden</Badge>}</p>
                      <p className="text-sm text-muted-foreground">{money(p.priceCents)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...p }); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Lab, Pharmacy…" />
                </div>
                <div className="space-y-2">
                  <Label>Price (cents)</Label>
                  <Input type="number" value={editing.priceCents ?? 0} onChange={(e) => setEditing({ ...editing, priceCents: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Active (shown in terminal)</span>
                <Switch checked={editing.isActive ?? true} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
