"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ProfileValues {
  fullName: string;
  title: string;
  specialty: string;
  bio: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  country: string;
  experienceYears: number;
}

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ProfileValues>(k: K, val: ProfileValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) throw new Error("Could not save");
      toast.success("Profile saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={v.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
        <Field label="Title"><Input value={v.title} onChange={(e) => set("title", e.target.value)} placeholder="MD, FACC" /></Field>
        <Field label="Specialty"><Input value={v.specialty} onChange={(e) => set("specialty", e.target.value)} /></Field>
        <Field label="Experience (years)"><Input type="number" value={v.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} /></Field>
        <Field label="Clinic name"><Input value={v.clinicName} onChange={(e) => set("clinicName", e.target.value)} /></Field>
        <Field label="Clinic address"><Input value={v.clinicAddress} onChange={(e) => set("clinicAddress", e.target.value)} /></Field>
        <Field label="City"><Input value={v.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Country"><Input value={v.country} onChange={(e) => set("country", e.target.value)} /></Field>
      </div>
      <Field label="Bio">
        <Textarea rows={4} value={v.bio} onChange={(e) => set("bio", e.target.value)} />
      </Field>
      <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
