"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export interface ModuleRow {
  key: string;
  name: string;
  description: string;
  status: string;
  enabled: boolean;
}

export function DoctorModuleToggles({
  doctorId,
  modules,
}: {
  doctorId: string;
  modules: ModuleRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(key: string, enabled: boolean) {
    setBusy(key);
    try {
      const res = await fetch(`/api/marketplace/admin/doctors/${doctorId}/module`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleKey: key, enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${key} ${enabled ? "enabled" : "disabled"}`);
      router.refresh();
    } catch {
      toast.error("Could not update module");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      {modules.map((m) => (
        <div key={m.key} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{m.name}</p>
              {m.status !== "active" && (
                <Badge variant="warning" className="capitalize">{m.status.replace("_", " ")}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{m.description}</p>
          </div>
          <Switch
            checked={m.enabled}
            disabled={busy === m.key}
            onCheckedChange={(v) => toggle(m.key, v)}
          />
        </div>
      ))}
    </div>
  );
}
