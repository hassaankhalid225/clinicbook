"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  color: string;
  isTelehealth: boolean;
  intakeNote: string | null;
  isActive: boolean;
}

const EMPTY: Partial<ServiceItem> = {
  name: "",
  description: "",
  durationMin: 30,
  priceCents: 0,
  color: "#0ea5e9",
  isTelehealth: false,
  intakeNote: "",
  isActive: true,
};

export function ServicesManager({
  initial,
  currency = "USD",
}: {
  initial: ServiceItem[];
  currency?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency });

  function openNew() {
    setEditing({ ...EMPTY });
    setOpen(true);
  }
  function openEdit(s: ServiceItem) {
    setEditing({ ...s });
    setOpen(true);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name ?? "",
      description: editing.description || null,
      durationMin: Number(editing.durationMin) || 30,
      priceCents: Math.round(Number(editing.priceCents) || 0),
      color: editing.color || "#0ea5e9",
      isTelehealth: Boolean(editing.isTelehealth),
      intakeNote: editing.intakeNote || null,
      isActive: editing.isActive ?? true,
    };
    const isEdit = Boolean(editing.id);
    try {
      const res = await fetch(
        isEdit ? `/api/doctor/services/${editing.id}` : "/api/doctor/services",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not save");
      toast.success(isEdit ? "Service updated" : "Service added");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/doctor/services/${id}`, { method: "DELETE" });
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
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      {initial.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No services yet. Add your first appointment type (e.g. &quot;Consultation
            — 30 min&quot;).
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {initial.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{s.name}</p>
                      {!s.isActive && <Badge variant="muted">Hidden</Badge>}
                      {s.isTelehealth && (
                        <Badge variant="info" className="gap-1">
                          <Video className="h-3 w-3" /> Video
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s.durationMin} min ·{" "}
                      {s.priceCents > 0 ? money.format(s.priceCents / 100) : "Free"}
                    </p>
                    {s.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Consultation"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={editing.durationMin ?? 30}
                    onChange={(e) =>
                      setEditing({ ...editing, durationMin: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ({currency}, in cents)</Label>
                  <Input
                    type="number"
                    value={editing.priceCents ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, priceCents: Number(e.target.value) })
                    }
                    placeholder="5000 = $50.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Telehealth (video) service</span>
                <Switch
                  checked={Boolean(editing.isTelehealth)}
                  onCheckedChange={(v) =>
                    setEditing({ ...editing, isTelehealth: v })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Active (shown on booking page)</span>
                <Switch
                  checked={editing.isActive ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, isActive: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
