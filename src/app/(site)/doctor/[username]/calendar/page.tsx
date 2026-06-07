import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { repositories } from "@/core/repositories";
import { initials } from "@/core/utils/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { BookingWidget } from "@/components/marketplace/booking-widget";

export default async function BookingCalendarPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const doctor = await repositories.doctors.getByUsername(username);
  if (!doctor) notFound();
  const services = await repositories.services.listByDoctor(doctor.id);

  return (
    <div className="container max-w-5xl py-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href={`/doctor/${doctor.username}`}>
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-5">
          <Avatar className="h-14 w-14">
            {doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt={doctor.fullName} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(doctor.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">Book with {doctor.fullName}</h1>
            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            <RatingStars rating={doctor.rating} showValue count={doctor.reviewCount} />
          </div>
        </CardContent>
      </Card>

      <BookingWidget
        doctorId={doctor.id}
        doctorName={doctor.fullName}
        services={services.map((s) => ({
          id: s.id,
          title: s.title,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
          currency: s.currency,
          consultationType: s.consultationType,
        }))}
      />
    </div>
  );
}
