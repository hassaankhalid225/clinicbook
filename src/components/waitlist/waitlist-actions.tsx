"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function WaitlistActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function invite() {
    setBusy(true);
    try {
      const res = await fetch(`/api/doctor/waitlist/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Could not invite");
      toast.success("Patient invited");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/doctor/waitlist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove");
      toast.success("Removed from waitlist");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      {status === "waiting" && (
        <Button variant="outline" size="sm" onClick={invite} disabled={busy}>
          <Send className="h-4 w-4" /> Invite
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={remove} disabled={busy}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
