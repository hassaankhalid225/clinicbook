"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AppointmentStatus } from "@/core/types";
import { Button } from "@/components/ui/button";

export function ApptActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(next: AppointmentStatus) {
    setBusy(true);
    try {
      const res = await fetch(`/api/marketplace/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Marked ${next.replace("_", "-")}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const done = ["cancelled", "completed", "no_show"].includes(status);
  if (done) {
    return (
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => set("confirmed")}>
        Reopen
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {status === "pending" && (
        <Button variant="outline" size="sm" disabled={busy} onClick={() => set("confirmed")}>
          Confirm
        </Button>
      )}
      <Button variant="outline" size="sm" disabled={busy} onClick={() => set("completed")}>
        Complete
      </Button>
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => set("no_show")}>
        No-show
      </Button>
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => set("cancelled")}>
        Cancel
      </Button>
    </div>
  );
}
