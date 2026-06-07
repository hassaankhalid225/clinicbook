import Link from "next/link";
import { Check, Circle, ArrowRight } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { env } from "@/lib/env";
import { availabilityService } from "@/modules/availability/availability.service";
import { serviceService } from "@/modules/services/service.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyLink } from "@/components/dashboard/copy-link";
import { cn } from "@/lib/utils";

export default async function GettingStartedPage() {
  const doctor = await requireDoctor();
  const [rules, services] = await Promise.all([
    availabilityService.listRules(doctor.id),
    serviceService.list(doctor.id),
  ]);

  const steps = [
    {
      title: "Complete your profile",
      desc: "Add your specialty, clinic, and a short bio.",
      href: "/dashboard/settings",
      done: Boolean(doctor.specialty && doctor.clinicName),
    },
    {
      title: "Set your availability",
      desc: "Choose your working days, hours, and breaks.",
      href: "/dashboard/availability",
      done: rules.some((r) => r.isActive),
    },
    {
      title: "Add your services",
      desc: "Define appointment types with durations and prices.",
      href: "/dashboard/services",
      done: services.length > 0,
    },
    {
      title: "Share your booking link",
      desc: "Put it on WhatsApp, your site, or Google listing.",
      href: "/dashboard",
      done: false,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const bookingUrl = `${env.appUrl}/book/${doctor.slug}`;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Getting started</h1>
        <p className="text-muted-foreground">
          {completed} of {steps.length} steps done — you&apos;re almost live.
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((s) => (
          <Card key={s.title} className={cn(s.done && "bg-muted/30")}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-start gap-3">
                {s.done ? (
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <Circle className="mt-0.5 h-6 w-6 text-muted-foreground/40" />
                )}
                <div>
                  <p className={cn("font-medium", s.done && "text-muted-foreground")}>
                    {s.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              {!s.done && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={s.href}>
                    Do it <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your booking link</CardTitle>
          <CardDescription>Share it anywhere to start taking bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <CopyLink url={bookingUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
