import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  MapPin, BadgeCheck, Globe, Languages, GraduationCap, Award,
  Video, Building2, Clock, CalendarPlus,
} from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { money, initials } from "@/core/utils/format";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/marketplace/rating-stars";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const doctor = await repositories.doctors.getByUsername(username);
  if (!doctor) return { title: "Doctor not found — MediBook" };
  const title = `${doctor.fullName} — ${doctor.specialty} | MediBook`;
  const description = doctor.bio.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/doctor/${doctor.username}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DoctorPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const doctor = await repositories.doctors.getByUsername(username);
  if (!doctor) notFound();

  const [services, reviews, client] = await Promise.all([
    repositories.services.listByDoctor(doctor.id),
    repositories.reviews.listByDoctor(doctor.id),
    repositories.clients.getById(MOCK_CURRENT.clientId),
  ]);
  const favorited = client?.favoriteDoctorIds.includes(doctor.id) ?? false;

  return (
    <div className="pb-16">
      {/* Cover */}
      <div className="h-44 w-full bg-gradient-to-r from-primary/80 to-indigo-500/80" />

      <div className="container -mt-16">
        {/* Header card */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-28 w-28 border-4 border-background shadow">
                {doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt={doctor.fullName} />}
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {initials(doctor.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{doctor.fullName}</h1>
                  {doctor.verified && <BadgeCheck className="h-5 w-5 text-sky-500" />}
                </div>
                <p className="text-muted-foreground">
                  {doctor.title} · {doctor.specialty}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <RatingStars rating={doctor.rating} showValue count={doctor.reviewCount} />
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {doctor.address.city}, {doctor.address.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {doctor.experienceYears} yrs exp
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <FavoriteButton doctorId={doctor.id} favorited={favorited} variant="full" />
              <Button size="lg" asChild>
                <Link href={`/doctor/${doctor.username}/calendar`}>
                  <CalendarPlus className="h-4 w-4" /> Book appointment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="space-y-6">
            <Section title="About">
              <p className="text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
            </Section>

            <Section title="Services">
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <div key={s.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{s.title}</p>
                      {s.consultationType !== "offline" && (
                        <Badge variant="info" className="gap-1"><Video className="h-3 w-3" /> Online</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                    <p className="mt-2 text-sm font-medium">
                      {s.durationMin} min · {money(s.priceCents, s.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Expertise">
              <div className="space-y-3 text-sm">
                <ChipRow label="Sub-specialties" items={doctor.expertise.subSpecialties} />
                <ChipRow label="Skills" items={doctor.expertise.skills} />
                <ChipRow label="Procedures" items={doctor.expertise.procedures} />
              </div>
            </Section>

            <Section title={`Reviews (${reviews.length})`}>
              <div className="space-y-4">
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.clientName}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                    {r.reply && (
                      <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                        <span className="font-medium">{doctor.fullName}: </span>
                        {r.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {doctor.clinicName && (
                  <Detail icon={Building2} label="Clinic" value={doctor.clinicName} />
                )}
                <Detail icon={GraduationCap} label="Qualification" value={doctor.qualification} />
                <Detail icon={Languages} label="Languages" value={doctor.languages.join(", ")} />
                {doctor.social.website && (
                  <Detail icon={Globe} label="Website" value={doctor.social.website} />
                )}
              </CardContent>
            </Card>

            {doctor.education.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Education</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {doctor.education.map((e, i) => (
                    <div key={i}>
                      <p className="font-medium">{e.degree}</p>
                      <p className="text-muted-foreground">{e.institution} · {e.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {doctor.awards.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Awards</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {doctor.awards.map((a, i) => (
                    <p key={i} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" /> {a.title} ({a.year})
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <Badge key={i} variant="secondary">{i}</Badge>
        ))}
      </div>
    </div>
  );
}

function Detail({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
