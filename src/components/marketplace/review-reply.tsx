"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReviewReply({ id }: { id: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!value.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/marketplace/reviews/${id}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: value }),
      });
      if (!res.ok) throw new Error("Could not reply");
      toast.success("Reply posted");
      setValue("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reply");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a public reply…"
        className="h-9"
      />
      <Button size="sm" onClick={send} disabled={busy}>Reply</Button>
    </div>
  );
}
