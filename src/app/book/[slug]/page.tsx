import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Stethoscope } from "lucide-react";
import { doctorService } from "@/modules/doctors/doctor.service";
import { getPlan } from "@/modules/billing/plans";
import { prisma } from "@/lib/prisma";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookingFlow } from "@/components/booking/booking-flow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await doctorService.findPublicBySlug(slug);
  if (!doctor) return { title: "Not found — ClinicBook" };
  return {
    title: `Book with ${doctor.fullName} — ClinicBook`,
    description: `Book an appointment online with ${doctor.fullName}${
      doctor.clinicName ? ` at ${doctor.clinicName}` : ""
    }.`,
  };
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doctor = await doctorService.findPublicBySlug(slug);
  if (!doctor) notFound();

  const services = await prisma.service.findMany({
    where: { doctorId: doctor.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, durationMin: true, priceCents: true },
  });

  const branded = getPlan(doctor.plan).branded;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-4xl space-y-6">
        {/* Doctor header */}
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              {doctor.avatarUrl && (
                <AvatarImage src={doctor.avatarUrl} alt={doctor.fullName} />
              )}
              <AvatarFallback className="text-lg">
                {initials(doctor.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{doctor.fullName}</h1>
              {doctor.specialty && (
                <p className="text-muted-foreground">{doctor.specialty}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {doctor.clinicName && (
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    {doctor.clinicName}
                  </span>
                )}
                {doctor.clinicAddress && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {doctor.clinicAddress}
                  </span>
                )}
              </div>
              {doctor.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{doctor.bio}</p>
              )}
            </div>
            <Badge variant="success">Accepting bookings</Badge>
          </CardContent>
        </Card>

        {/* Booking flow */}
        <Card>
          <CardContent className="p-6">
            <BookingFlow
              doctor={{
                slug: doctor.slug,
                fullName: doctor.fullName,
                clinicName: doctor.clinicName,
              }}
              services={services}
            />
          </CardContent>
        </Card>

        {branded && (
          <p className="text-center text-xs text-muted-foreground">
            Powered by{" "}
            <a href="/" className="font-medium text-primary hover:underline">
              ClinicBook
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
