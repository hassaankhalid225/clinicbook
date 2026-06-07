import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProviderProfilePage() {
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Your public profile at <span className="font-mono text-primary">/doctor/{doctor.username}</span>
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Basic information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" defaultValue={doctor.fullName} />
          <Field label="Title" defaultValue={doctor.title ?? ""} />
          <Field label="Specialty" defaultValue={doctor.specialty} />
          <Field label="Experience (years)" defaultValue={String(doctor.experienceYears)} />
          <Field label="Clinic" defaultValue={doctor.clinicName ?? ""} />
          <Field label="City" defaultValue={doctor.address.city} />
          <div className="space-y-2 sm:col-span-2">
            <Label>Bio</Label>
            <Textarea defaultValue={doctor.bio} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credentials</CardTitle>
          <CardDescription>Qualifications, certifications, and languages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Qualification" defaultValue={doctor.qualification} />
          <div>
            <Label className="mb-2 block">Certifications</Label>
            <div className="flex flex-wrap gap-1.5">
              {doctor.certifications.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Languages</Label>
            <div className="flex flex-wrap gap-1.5">
              {doctor.languages.map((l) => <Badge key={l} variant="outline">{l}</Badge>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}
