import Link from "next/link";
import {
  Stethoscope, HeartPulse, Sparkles, Brain, Baby, Smile, Bone, Apple,
  Search, CalendarClock, CheckCircle2, ArrowRight, Star, ShieldCheck,
} from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CATEGORIES, MOCK_TESTIMONIALS, MOCK_FAQS, HOW_IT_WORKS } from "@/mock/data/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchBar } from "@/components/marketplace/search-bar";
import { DoctorCard } from "@/components/marketplace/doctor-card";
import { RatingStars } from "@/components/marketplace/rating-stars";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope, HeartPulse, Sparkles, Brain, Baby, Smile, Bone, Apple,
  Search, CalendarClock, CheckCircle2,
};

export default async function LandingPage() {
  const [featured, modules] = await Promise.all([
    repositories.doctors.featured(4),
    repositories.modules.list(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <Badge variant="info" className="px-3 py-1">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Trusted by 600+ providers
          </Badge>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Find the right doctor and{" "}
            <span className="text-primary">book in seconds</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Search by specialty, location, and availability. Read real reviews.
            Book instantly — no phone calls, no waiting rooms on hold.
          </p>
          <div className="mt-2 w-full max-w-2xl">
            <SearchBar />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>Popular:</span>
            {["Cardiology", "Dermatology", "Mental Health", "Dentistry"].map((s) => (
              <Link key={s} href={`/doctors?q=${encodeURIComponent(s)}`} className="hover:text-primary hover:underline">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="container py-16">
        <SectionHeading title="Browse by specialty" subtitle="Find the expertise you need." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MOCK_CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon] ?? Stethoscope;
            return (
              <Link key={c.slug} href={`/doctors?q=${encodeURIComponent(c.name)}`}>
                <Card className="group h-full transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.doctorCount} doctors</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <SectionHeading title="Featured doctors" subtitle="Top-rated providers ready to see you." align="left" />
            <Button variant="outline" asChild>
              <Link href="/doctors">View all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container py-16">
        <SectionHeading title="How it works" subtitle="Three steps from search to booked." />
        <div className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((s) => {
            const Icon = ICONS[s.icon] ?? Search;
            return (
              <Card key={s.step}>
                <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </span>
                  <p className="text-sm font-semibold text-primary">Step {s.step}</p>
                  <p className="text-lg font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <SectionHeading title="Loved by doctors and patients" subtitle="Real stories from the MediBook community." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_TESTIMONIALS.map((t) => (
              <Card key={t.name}>
                <CardContent className="space-y-3 p-6">
                  <RatingStars rating={t.rating} />
                  <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container py-16">
        <SectionHeading
          title="Composable pricing — pay only for what you use"
          subtitle="No per-booking fees. Start free with core scheduling, then add modules as you grow."
        />
        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const free = m.priceMonthly === 0;
            return (
              <Card key={m.key} className={free ? "border-primary/40" : ""}>
                <CardContent className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {free ? (
                      <Badge variant="secondary">Included</Badge>
                    ) : (
                      <span className="font-semibold">${m.priceMonthly}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Button size="lg" asChild>
            <Link href="/auth/login?role=doctor">Start free &amp; compose your plan</Link>
          </Button>
          <p className="text-sm text-muted-foreground">Core scheduling &amp; booking are always free.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <SectionHeading title="Frequently asked questions" subtitle="Everything you need to know." />
          <Accordion type="single" collapsible className="rounded-lg border bg-background px-4">
            {MOCK_FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-background">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Star className="h-10 w-10 text-primary" />
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="max-w-md text-muted-foreground">
              Patients: find your doctor today. Doctors: be live in 10 minutes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild><Link href="/doctors">Find a doctor</Link></Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login?role=doctor">Join as Doctor</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function SectionHeading({
  title, subtitle, align = "center",
}: {
  title: string; subtitle?: string; align?: "center" | "left";
}) {
  return (
    <div className={`mb-8 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
