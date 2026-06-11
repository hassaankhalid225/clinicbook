"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ExpertiseValues {
  subSpecialties: string;
  skills: string;
  procedures: string;
  certifications: string;
  languages: string;
}

export function ExpertiseForm({ initial }: { initial: ExpertiseValues }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v), // comma-separated strings → arrays server-side
      });
      if (!res.ok) throw new Error("Could not save");
      toast.success("Expertise saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof ExpertiseValues, label: string, placeholder: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={v[key]}
        onChange={(e) => setV((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
      />
      <p className="text-xs text-muted-foreground">Comma-separated</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {field("subSpecialties", "Sub-specialties", "Preventive Care, Chronic Disease")}
      {field("skills", "Skills", "Diagnosis, Wellness Plans")}
      {field("procedures", "Procedures", "Health Screening, Vaccinations")}
      {field("certifications", "Certifications", "Board Certified, ACLS")}
      {field("languages", "Languages", "English, Spanish")}
      <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save expertise"}</Button>
    </div>
  );
}
