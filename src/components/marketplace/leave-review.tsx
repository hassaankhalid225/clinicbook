"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function LeaveReview({
  doctorId,
  doctorName,
}: {
  doctorId: string;
  doctorName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (comment.trim().length < 3) {
      toast.error("Please write a short comment");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/marketplace/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, rating, comment }),
      });
      if (!res.ok) throw new Error("Could not submit review");
      toast.success("Thanks for your review!");
      setOpen(false);
      setComment("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {doctorName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
              >
                <Star className={cn("h-7 w-7", i <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-muted")} />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit review"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
