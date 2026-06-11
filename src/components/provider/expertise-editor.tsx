"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TagInput } from "@/components/provider/tag-input";

export interface ExpertiseLists {
  subSpecialties: string[];
  skills: string[];
  procedures: string[];
  certifications: string[];
  languages: string[];
}

/**
 * Tag-style expertise editor. Each add/remove persists the full set to the DB
 * (/api/provider/profile), so the doctor's discovery filters update instantly.
 */
export function ExpertiseEditor({ initial }: { initial: ExpertiseLists }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function persist(next: ExpertiseLists) {
    setV(next);
    setSaving(true);
    try {
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Could not save");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setV(v); // revert
    } finally {
      setSaving(false);
    }
  }

  const update = (key: keyof ExpertiseLists) => (next: string[]) =>
    persist({ ...v, [key]: next });

  return (
    <div className="space-y-5">
      <TagInput label="Sub-specialties" values={v.subSpecialties} placeholder="e.g. Preventive Care" onChange={update("subSpecialties")} />
      <TagInput label="Skills" values={v.skills} placeholder="e.g. Diagnosis" onChange={update("skills")} />
      <TagInput label="Procedures" values={v.procedures} placeholder="e.g. Vaccinations" onChange={update("procedures")} />
      <TagInput label="Certifications" values={v.certifications} placeholder="e.g. Board Certified" onChange={update("certifications")} />
      <TagInput label="Languages" values={v.languages} placeholder="e.g. English" onChange={update("languages")} />
      <p className="text-xs text-muted-foreground">{saving ? "Saving…" : "Changes save automatically."}</p>
    </div>
  );
}
