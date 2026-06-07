"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CancelFlow({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function cancel() {
    setState("loading");
    try {
      const res = await fetch(`/api/book/cancel/${token}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not cancel");
      setState("done");
      setMessage(
        json.data.alreadyCancelled
          ? "This appointment was already cancelled."
          : "Your appointment has been cancelled.",
      );
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Could not cancel");
    }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h2 className="text-xl font-bold">Cancelled</h2>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild variant="outline">
          <Link href="/">Back to ClinicBook</Link>
        </Button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-14 w-14 text-destructive" />
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={() => setState("idle")} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-xl font-bold">Cancel your appointment?</h2>
      <p className="text-muted-foreground">
        This will free up the slot. This action can&apos;t be undone.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">Keep it</Link>
        </Button>
        <Button
          variant="destructive"
          onClick={cancel}
          disabled={state === "loading"}
        >
          {state === "loading" ? "Cancelling…" : "Yes, cancel"}
        </Button>
      </div>
    </div>
  );
}
