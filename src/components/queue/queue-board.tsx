"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Check, SkipForward, X, UserPlus, TicketCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QueueEntryItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  status: "waiting" | "in_progress" | "completed" | "skipped" | "cancelled";
}

export interface CheckInCandidate {
  id: string;
  time: string;
  patientName: string;
}

export function QueueBoard({
  entries,
  candidates,
}: {
  entries: QueueEntryItem[];
  candidates: CheckInCandidate[];
}) {
  const router = useRouter();
  const [walkIn, setWalkIn] = useState("");
  const [busy, setBusy] = useState(false);

  async function api(path: string, init: RequestInit, okMsg: string) {
    setBusy(true);
    try {
      const res = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Action failed");
      toast.success(okMsg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const act = (id: string, action: string, msg: string) =>
    api(`/api/queue/${id}`, { method: "PUT", body: JSON.stringify({ action }) }, msg);

  const active = entries.filter((e) => ["waiting", "in_progress"].includes(e.status));
  const done = entries.filter((e) => !["waiting", "in_progress"].includes(e.status));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {active.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Queue is empty. Check in an appointment or add a walk-in.
            </CardContent>
          </Card>
        )}
        {active.map((e) => (
          <Card
            key={e.id}
            className={cn(e.status === "in_progress" && "border-primary shadow-sm")}
          >
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                    e.status === "in_progress"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {e.tokenNumber}
                </span>
                <div>
                  <p className="font-medium">{e.patientName}</p>
                  <Badge variant={e.status === "in_progress" ? "info" : "muted"}>
                    {e.status === "in_progress" ? "Now serving" : "Waiting"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1.5">
                {e.status === "waiting" && (
                  <Button size="sm" disabled={busy} onClick={() => act(e.id, "start", `Token ${e.tokenNumber} called in`)}>
                    <Play className="h-4 w-4" /> Start
                  </Button>
                )}
                {e.status === "in_progress" && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => act(e.id, "complete", "Visit completed")}>
                    <Check className="h-4 w-4" /> Done
                  </Button>
                )}
                <Button size="icon" variant="ghost" disabled={busy} onClick={() => act(e.id, "skip", "Skipped")} aria-label="Skip">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={busy} onClick={() => act(e.id, "cancel", "Removed")} aria-label="Cancel">
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {done.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Finished today</p>
            <div className="space-y-1.5">
              {done.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>
                    <span className="mr-2 font-semibold">#{e.tokenNumber}</span>
                    {e.patientName}
                  </span>
                  <Badge variant={e.status === "completed" ? "success" : "muted"} className="capitalize">
                    {e.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="flex items-center gap-2 font-semibold">
              <TicketCheck className="h-4 w-4 text-primary" /> Check in booked patients
            </p>
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending check-ins.</p>
            ) : (
              candidates.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <span>
                    <span className="mr-2 font-medium">{c.time}</span>
                    {c.patientName}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      api("/api/queue", { method: "POST", body: JSON.stringify({ appointmentId: c.id }) }, `${c.patientName} checked in`)
                    }
                  >
                    Check in
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="flex items-center gap-2 font-semibold">
              <UserPlus className="h-4 w-4 text-primary" /> Add walk-in
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Patient name"
                value={walkIn}
                onChange={(e) => setWalkIn(e.target.value)}
              />
              <Button
                disabled={busy || walkIn.trim().length < 2}
                onClick={() =>
                  api("/api/queue", { method: "POST", body: JSON.stringify({ patientName: walkIn.trim() }) }, "Walk-in added to queue").then(() => setWalkIn(""))
                }
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
