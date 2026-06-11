import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpertiseForm } from "@/components/provider/expertise-form";

export default async function ProviderExpertisePage() {
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return null;
  const e = doctor.expertise;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expertise</h1>
        <p className="text-muted-foreground">
          These power discovery filters and your public profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specialties, skills &amp; procedures</CardTitle>
          <CardDescription>Help patients find you for the right care.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpertiseForm
            initial={{
              subSpecialties: e.subSpecialties.join(", "),
              skills: e.skills.join(", "),
              procedures: e.procedures.join(", "),
              certifications: doctor.certifications.join(", "),
              languages: doctor.languages.join(", "),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
