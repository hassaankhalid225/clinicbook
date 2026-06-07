"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Clock, Video } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/core/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  priceCents: number;
  currency: string;
  category: string;
  consultationType: "online" | "offline" | "both";
  isActive: boolean;
}

const EMPTY: Partial<ServiceItem> = {
  title: "", description: "", durationMin: 30, priceCents: 5000,
  currency: "USD", category: "General", consultationType: "both", isActive: true,
};

export function ServiceManager({ initial }: { initial: ServiceItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [busy, setBusy] = useState(false);

  function openNew() { setEditing({ ...EMPTY }); setOpen(true); }
  function openEdit(s: ServiceItem) { setEditing({ ...s }); setOpen(true); }

  async function save() {
    if (!editing?.title || editing.title.length < 2) { toast.error("Enter a title"); return; }
    setBusy(true);
    const body = {
      title: editing.title,
      description: editing.description ?? "",
      durationMin: Number(editing.durationMin) || 30,
      priceCents: Math.round(Number(editing.priceCents) || 0),
      currency: editing.currency ?? "USD",
      category: editing.category ?? "General",
      consultationType: editing.consultationType ?? "both",
      isActive: editing.isActive ?? true,
    };
    const isEdit = Boolean(editing.id);
    try {
      const res = await fetch(
        isEdit ? `/api/marketplace/services/${editing.id}` : "/api/marketplace/services",
        { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) throw new Error("Could not save");
      toast.success(isEdit ? "Service updated" : "Service added");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/marketplace/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete");
      toast.success("Service deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add service</Button>
      </div>

      {initial.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
          No services yet — add your first appointment type.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {initial.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{s.title}</p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{s.description}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
                  <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{s.durationMin}m</Badge>
                  <Badge variant="outline">{money(s.priceCents, s.currency)}</Badge>
                  <Badge variant="muted">{s.category}</Badge>
                  {s.consultationType !== "offline" && <Badge variant="info"><Video className="mr-1 h-3 w-3" />Online</Badge>}
                  {!s.isActive && <Badge variant="warning">Hidden</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit service" : "Add service"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={editing.durationMin ?? 30} onChange={(e) => setEditing({ ...editing, durationMin: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Price (cents)</Label>
                  <Input type="number" value={editing.priceCents ?? 0} onChange={(e) => setEditing({ ...editing, priceCents: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editing.consultationType ?? "both"} onValueChange={(v) => setEditing({ ...editing, consultationType: v as ServiceItem["consultationType"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Online &amp; in-person</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">In-person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Active (shown on booking page)</span>
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
