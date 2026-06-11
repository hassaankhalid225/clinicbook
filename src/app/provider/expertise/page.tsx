import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpertiseEditor } from "@/components/provider/expertise-editor";

export default async function ProviderExpertisePage() {
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return null;
  const e = doctor.expertise;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expertise</h1>
        <p className="text-muted-foreground">
          Add or remove tags — these power discovery filters and your public profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specialties, skills &amp; procedures</CardTitle>
          <CardDescription>Help patients find you for the right care.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpertiseEditor
            initial={{
              subSpecialties: e.subSpecialties,
              skills: e.skills,
              procedures: e.procedures,
              certifications: doctor.certifications,
              languages: doctor.languages,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
