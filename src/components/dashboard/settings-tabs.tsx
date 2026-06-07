"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyLink } from "@/components/dashboard/copy-link";

export interface DoctorSettings {
  fullName: string;
  specialty: string | null;
  clinicName: string | null;
  clinicAddress: string | null;
  phone: string | null;
  timezone: string;
  bio: string | null;
  welcomeMessage: string | null;
  brandColor: string;
  cancellationPolicy: string | null;
  currency: string;
  language: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  reminderHoursBefore: number;
  plan: string;
}

interface PlanCard {
  id: string;
  name: string;
  priceMonthly: number;
  features: string[];
}

async function patch(body: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/doctor/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    toast.error(json?.error?.message ?? "Could not save");
    return false;
  }
  return true;
}

export function SettingsTabs({
  settings,
  plans,
  bookingUrl,
}: {
  settings: DoctorSettings;
  plans: PlanCard[];
  bookingUrl: string;
}) {
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof DoctorSettings>(k: K, v: DoctorSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  async function save(fields: (keyof DoctorSettings)[], label: string) {
    setSaving(true);
    const body: Record<string, unknown> = {};
    for (const f of fields) body[f] = s[f];
    if (await patch(body)) {
      toast.success(`${label} saved`);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-4 flex-wrap">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="booking">Booking page</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      {/* PROFILE */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>Shown on your booking page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-2">
              <Label className="mb-2 block">Booking link</Label>
              <CopyLink url={bookingUrl} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={s.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </Field>
              <Field label="Specialty">
                <Input value={s.specialty ?? ""} onChange={(e) => set("specialty", e.target.value)} />
              </Field>
              <Field label="Clinic name">
                <Input value={s.clinicName ?? ""} onChange={(e) => set("clinicName", e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={s.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="Clinic address" full>
                <Input value={s.clinicAddress ?? ""} onChange={(e) => set("clinicAddress", e.target.value)} />
              </Field>
              <Field label="Timezone">
                <Input value={s.timezone} onChange={(e) => set("timezone", e.target.value)} />
              </Field>
            </div>
            <Field label="Bio">
              <Textarea value={s.bio ?? ""} onChange={(e) => set("bio", e.target.value)} rows={3} />
            </Field>
            <Button
              disabled={saving}
              onClick={() =>
                save(
                  ["fullName", "specialty", "clinicName", "phone", "clinicAddress", "timezone", "bio"],
                  "Profile",
                )
              }
            >
              Save profile
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* BOOKING PAGE */}
      <TabsContent value="booking">
        <Card>
          <CardHeader>
            <CardTitle>Booking page</CardTitle>
            <CardDescription>Customize what patients see and your policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Welcome message">
              <Textarea
                value={s.welcomeMessage ?? ""}
                onChange={(e) => set("welcomeMessage", e.target.value)}
                placeholder="Welcome! Book a time that works for you."
                rows={2}
              />
            </Field>
            <Field label="Cancellation policy">
              <Textarea
                value={s.cancellationPolicy ?? ""}
                onChange={(e) => set("cancellationPolicy", e.target.value)}
                placeholder="Please give 24 hours notice to cancel."
                rows={2}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Brand color">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={s.brandColor}
                    onChange={(e) => set("brandColor", e.target.value)}
                    className="h-10 w-12 rounded border"
                  />
                  <Input value={s.brandColor} onChange={(e) => set("brandColor", e.target.value)} />
                </div>
              </Field>
              <Field label="Currency">
                <Input value={s.currency} maxLength={3} onChange={(e) => set("currency", e.target.value.toUpperCase())} />
              </Field>
              <Field label="Language">
                <Input value={s.language} onChange={(e) => set("language", e.target.value)} />
              </Field>
            </div>
            <Button
              disabled={saving}
              onClick={() =>
                save(["welcomeMessage", "cancellationPolicy", "brandColor", "currency", "language"], "Booking page")
              }
            >
              Save booking page
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* NOTIFICATIONS */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications &amp; reminders</CardTitle>
            <CardDescription>How patients are confirmed and reminded.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle
              label="SMS notifications"
              desc="Send confirmations and reminders by text."
              checked={s.smsEnabled}
              onChange={(v) => set("smsEnabled", v)}
            />
            <Toggle
              label="Email notifications"
              desc="Send confirmations and reminders by email."
              checked={s.emailEnabled}
              onChange={(v) => set("emailEnabled", v)}
            />
            <Field label="Reminder timing (hours before appointment)">
              <Input
                type="number"
                value={s.reminderHoursBefore}
                onChange={(e) => set("reminderHoursBefore", Number(e.target.value))}
                className="w-32"
              />
            </Field>
            <Button
              disabled={saving}
              onClick={() => save(["smsEnabled", "emailEnabled", "reminderHoursBefore"], "Notifications")}
            >
              Save notifications
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* BILLING */}
      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Current plan:{" "}
              <Badge variant="secondary" className="ml-1 capitalize">
                {s.plan}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((p) => {
                const current = p.id === s.plan;
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-4 ${current ? "border-primary bg-primary/5" : ""}`}
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="my-1 text-2xl font-bold">
                      ${p.priceMonthly}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <ul className="my-3 space-y-1 text-xs text-muted-foreground">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-1">
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant={current ? "outline" : "default"}
                      className="w-full"
                      disabled={current}
                      onClick={() => toast.info("Stripe checkout is wired in the roadmap.")}
                    >
                      {current ? "Current plan" : "Upgrade"}
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Payments via Stripe are part of the roadmap — plan changes are
              simulated here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
