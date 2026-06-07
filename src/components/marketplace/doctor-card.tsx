import Link from "next/link";
import { MapPin, Video, BadgeCheck } from "lucide-react";
import type { Doctor } from "@/core/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "./rating-stars";
import { FavoriteButton } from "./favorite-button";
import { initials } from "@/core/utils/format";

export function DoctorCard({
  doctor,
  distanceKm,
  favorited,
}: {
  doctor: Doctor;
  distanceKm?: number;
  favorited?: boolean;
}) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-20 w-full bg-gradient-to-r from-primary to-indigo-500">
        {favorited != null && (
          <div className="absolute right-2 top-2">
            <FavoriteButton doctorId={doctor.id} favorited={favorited} />
          </div>
        )}
      </div>
      <CardContent className="-mt-10 space-y-3 p-5">
        <div className="flex items-end justify-between">
          <Avatar className="h-16 w-16 border-4 border-background">
            {doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt={doctor.fullName} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(doctor.fullName)}
            </AvatarFallback>
          </Avatar>
          {doctor.consultationType !== "offline" && (
            <Badge variant="info" className="gap-1">
              <Video className="h-3 w-3" /> Online
            </Badge>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1">
            <Link
              href={`/doctor/${doctor.username}`}
              className="font-semibold hover:text-primary hover:underline"
            >
              {doctor.fullName}
            </Link>
            {doctor.verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
          </div>
          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
        </div>

        <RatingStars rating={doctor.rating} showValue count={doctor.reviewCount} />

        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {doctor.address.city}, {doctor.address.country}
          {distanceKm != null && (
            <span className="ml-1 text-xs">· {distanceKm} km away</span>
          )}
        </p>

        <div className="flex gap-2 pt-1">
          <Button asChild className="flex-1">
            <Link href={`/doctor/${doctor.username}/calendar`}>Book</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/doctor/${doctor.username}`}>View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
