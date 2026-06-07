"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface DoctorProfile {
  fullName: string;
  specialty: string | null;
  clinicName: string | null;
  clinicAddress: string | null;
  phone: string | null;
  timezone: string;
  bio: string | null;
}

export function SettingsForm({ profile }: { profile: DoctorProfile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") ?? ""),
      specialty: String(fd.get("specialty") ?? "") || null,
      clinicName: String(fd.get("clinicName") ?? "") || null,
      clinicAddress: String(fd.get("clinicAddress") ?? "") || null,
      phone: String(fd.get("phone") ?? "") || null,
      timezone: String(fd.get("timezone") ?? "America/New_York"),
      bio: String(fd.get("bio") ?? "") || null,
    };
    try {
      const res = await fetch("/api/doctor/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not save");
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={profile.fullName}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            name="specialty"
            defaultValue={profile.specialty ?? ""}
            placeholder="General Physician"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clinicName">Clinic name</Label>
          <Input
            id="clinicName"
            name="clinicName"
            defaultValue={profile.clinicName ?? ""}
            placeholder="HealthFirst Clinic"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phone ?? ""}
            placeholder="+1 212 555 0199"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="clinicAddress">Clinic address</Label>
          <Input
            id="clinicAddress"
            name="clinicAddress"
            defaultValue={profile.clinicAddress ?? ""}
            placeholder="123 Main St, Manhattan, NY"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={profile.timezone}
            placeholder="America/New_York"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="Tell patients a little about your practice."
          rows={4}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
