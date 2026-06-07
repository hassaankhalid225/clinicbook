"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  doctorId,
  favorited: initial,
  variant = "icon",
}: {
  doctorId: string;
  favorited: boolean;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    setFavorited((v) => !v); // optimistic
    try {
      const res = await fetch("/api/marketplace/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Failed");
      setFavorited(json.data.favorited);
      toast.success(json.data.favorited ? "Added to favorites" : "Removed from favorites");
      router.refresh();
    } catch {
      setFavorited(initial);
      toast.error("Could not update favorites");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "full") {
    return (
      <Button variant="outline" onClick={toggle} disabled={busy}>
        <Heart className={cn("h-4 w-4", favorited && "fill-red-500 text-red-500")} />
        {favorited ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label="Toggle favorite"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
    >
      <Heart className={cn("h-4 w-4", favorited ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
    </button>
  );
}
