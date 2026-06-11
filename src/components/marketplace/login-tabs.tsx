"use client";

import { useState } from "react";
import Link from "next/link";
import { Stethoscope, User, Shield, Mail, Chrome, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/core/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginTabs({ defaultRole = "client" }: { defaultRole?: Role }) {
  const [busy, setBusy] = useState(false);

  async function enter(role: Role) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Sign-in failed");
      toast.success(`Signed in as ${role}`);
      // Full navigation guarantees the fresh build is loaded.
      window.location.href = json.data.home;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <Tabs defaultValue={defaultRole} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="client"><User className="mr-1 h-4 w-4" />Client</TabsTrigger>
        <TabsTrigger value="doctor"><Stethoscope className="mr-1 h-4 w-4" />Doctor</TabsTrigger>
        <TabsTrigger value="admin"><Shield className="mr-1 h-4 w-4" />Admin</TabsTrigger>
      </TabsList>

      {(["client", "doctor", "admin"] as Role[]).map((role) => (
        <TabsContent key={role} value={role}>
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                {role === "client" && "Book and manage your appointments."}
                {role === "doctor" && "Manage your profile, availability, and bookings."}
                {role === "admin" && "Manage the platform, doctors, and subscriptions."}
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); enter(role); }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full">
                  Continue as {role}
                </Button>
              </form>

              <div className="relative py-1 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-background px-2">or continue with</span>
                <span className="absolute left-0 top-1/2 h-px w-full bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => enter(role)}>
                  <Chrome className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => enter(role)}>
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => enter(role)}>
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Demo mode — no real authentication. Google / Email / Magic-link
                are wired in Phase 2.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      ))}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Browsing as a patient?{" "}
        <Link href="/doctors" className="text-primary hover:underline">Find a doctor</Link>
      </p>
    </Tabs>
  );
}
