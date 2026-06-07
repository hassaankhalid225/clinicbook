"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NearMeButton() {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);

  function locate() {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported in this browser");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const sp = new URLSearchParams(params.toString());
        sp.set("lat", pos.coords.latitude.toFixed(4));
        sp.set("lng", pos.coords.longitude.toFixed(4));
        router.push(`/doctors?${sp.toString()}`);
        setBusy(false);
      },
      () => {
        toast.error("Couldn't get your location");
        setBusy(false);
      },
      { timeout: 8000 },
    );
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={locate} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
      Use my location
    </Button>
  );
}
