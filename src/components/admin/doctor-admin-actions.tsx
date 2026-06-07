"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Ban, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import type { DoctorStatus } from "@/core/types";
import { Button } from "@/components/ui/button";

export function DoctorAdminActions({
  id,
  status,
  verified,
}: {
  id: string;
  status: DoctorStatus;
  verified: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>, msg: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/marketplace/admin/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(msg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {status !== "active" && (
        <Button variant="outline" size="sm" disabled={busy} onClick={() => patch({ status: "active" }, "Doctor approved")}>
          <Check className="h-4 w-4" /> Approve
        </Button>
      )}
      {status === "active" && (
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => patch({ status: "suspended" }, "Doctor suspended")}>
          <Ban className="h-4 w-4" /> Suspend
        </Button>
      )}
      <Button
        variant={verified ? "ghost" : "outline"}
        size="sm"
        disabled={busy}
        onClick={() => patch({ verified: !verified }, verified ? "Verification removed" : "Doctor verified")}
      >
        <BadgeCheck className="h-4 w-4" /> {verified ? "Unverify" : "Verify"}
      </Button>
    </div>
  );
}
