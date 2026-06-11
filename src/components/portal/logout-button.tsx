"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Clears the marketplace session via the stable API route, then leaves. */
export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={logout} disabled={busy}>
      <LogOut className="h-4 w-4" /> Log out
    </Button>
  );
}
