import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { patientService } from "@/modules/patients/patient.service";
import { formatDateOnly } from "@/lib/datetime";
import { AppError } from "@/lib/errors";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/appointments/status-badge";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const doctor = await requireDoctor();
  const { id } = await params;

  let patient;
  try {
    patient = await patientService.getForDoctor(doctor.id, id);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) notFound();
    throw err;
  }

  const visits = patient.appointments.length;
  const completed = patient.appointments.filter((a) => a.status === "completed").length;
  const noShows = patient.appointments.filter((a) => a.status === "no_show").length;

  return (
    <div className="max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/patients">
          <ArrowLeft className="h-4 w-4" /> Back to patients
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{patient.fullName}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" /> {patient.phone}
            </span>
            {patient.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {patient.email}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total visits" value={visits} />
        <Stat label="Completed" value={completed} />
        <Stat label="No-shows" value={noShows} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit history</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.appointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No appointments yet.
            </p>
          ) : (
            <ul className="divide-y">
              {patient.appointments.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">
                      {formatDateOnly(a.appointmentDate)} · {a.startTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {a.service?.name ? `${a.service.name} · ` : ""}
                      {a.reason ?? "—"}
                      {a.isTelehealth && " · Telehealth"}
                    </p>
                    {a.notes && (
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        Note: {a.notes}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
