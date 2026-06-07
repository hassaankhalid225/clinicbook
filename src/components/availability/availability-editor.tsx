"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DURATIONS = [15, 20, 30, 60];

export interface RuleState {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  breakStart: string;
  breakEnd: string;
}

export function AvailabilityEditor({ initial }: { initial: RuleState[] }) {
  const router = useRouter();
  const [rules, setRules] = useState<RuleState[]>(initial);
  const [savingDay, setSavingDay] = useState<number | null>(null);

  function patch(day: number, change: Partial<RuleState>) {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === day ? { ...r, ...change } : r)),
    );
  }

  async function save(rule: RuleState) {
    setSavingDay(rule.dayOfWeek);
    try {
      if (!rule.enabled) {
        const res = await fetch(
          `/api/doctor/availability/${rule.dayOfWeek}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Could not update");
        toast.success(`${DAYS[rule.dayOfWeek]} set to unavailable`);
      } else {
        const body = {
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          slotDurationMin: rule.slotDurationMin,
          breakStart: rule.breakStart || null,
          breakEnd: rule.breakEnd || null,
        };
        const res = await fetch("/api/doctor/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.error?.message ?? "Could not save");
        }
        toast.success(`${DAYS[rule.dayOfWeek]} saved`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSavingDay(null);
    }
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <Card key={rule.dayOfWeek}>
          <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end">
            <div className="flex w-40 items-center gap-3">
              <Switch
                checked={rule.enabled}
                onCheckedChange={(v) => patch(rule.dayOfWeek, { enabled: v })}
              />
              <span className="font-medium">{DAYS[rule.dayOfWeek]}</span>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Field label="Start">
                <Input
                  type="time"
                  value={rule.startTime}
                  disabled={!rule.enabled}
                  onChange={(e) =>
                    patch(rule.dayOfWeek, { startTime: e.target.value })
                  }
                />
              </Field>
              <Field label="End">
                <Input
                  type="time"
                  value={rule.endTime}
                  disabled={!rule.enabled}
                  onChange={(e) =>
                    patch(rule.dayOfWeek, { endTime: e.target.value })
                  }
                />
              </Field>
              <Field label="Slot">
                <Select
                  value={String(rule.slotDurationMin)}
                  disabled={!rule.enabled}
                  onValueChange={(v) =>
                    patch(rule.dayOfWeek, { slotDurationMin: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Break start">
                <Input
                  type="time"
                  value={rule.breakStart}
                  disabled={!rule.enabled}
                  onChange={(e) =>
                    patch(rule.dayOfWeek, { breakStart: e.target.value })
                  }
                />
              </Field>
              <Field label="Break end">
                <Input
                  type="time"
                  value={rule.breakEnd}
                  disabled={!rule.enabled}
                  onChange={(e) =>
                    patch(rule.dayOfWeek, { breakEnd: e.target.value })
                  }
                />
              </Field>
            </div>

            <Button
              onClick={() => save(rule)}
              disabled={savingDay === rule.dayOfWeek}
              className="shrink-0"
            >
              {savingDay === rule.dayOfWeek ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
