import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin } from "lucide-react";
import { repositories } from "@/core/repositories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { DoctorAdminActions } from "@/components/admin/doctor-admin-actions";
import { DoctorModuleToggles } from "@/components/admin/doctor-module-toggles";

export default async function AdminDoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [doctor, modules, access] = await Promise.all([
    repositories.doctors.getById(id),
    repositories.modules.list(),
    repositories.modules.accessForDoctor(id),
  ]);
  if (!doctor) notFound();
  const enabled = new Set(access.filter((a) => a.enabled).map((a) => a.moduleKey));

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/doctors"><ArrowLeft className="h-4 w-4" /> Back to doctors</Link>
      </Button>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{doctor.fullName}</h1>
              {doctor.verified && <BadgeCheck className="h-5 w-5 text-sky-500" />}
            </div>
            <p className="text-muted-foreground">{doctor.specialty}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <RatingStars rating={doctor.rating} showValue count={doctor.reviewCount} />
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{doctor.address.city}, {doctor.address.country}</span>
              <Badge variant="secondary" className="capitalize">{doctor.planId}</Badge>
            </div>
          </div>
          <DoctorAdminActions id={doctor.id} status={doctor.status} verified={doctor.verified} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module access</CardTitle>
          <CardDescription>Enable or disable platform modules for this doctor.</CardDescription>
        </CardHeader>
        <CardContent>
          <DoctorModuleToggles
            doctorId={doctor.id}
            modules={modules.map((m) => ({
              key: m.key,
              name: m.name,
              description: m.description,
              status: m.status,
              enabled: enabled.has(m.key),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
