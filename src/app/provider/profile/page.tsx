import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/provider/profile-form";

export default async function ProviderProfilePage() {
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Your public profile at{" "}
          <span className="font-mono text-primary">/doctor/{doctor.username}</span> — changes save instantly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Shown on your marketplace profile and booking page.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              fullName: doctor.fullName,
              title: doctor.title ?? "",
              specialty: doctor.specialty,
              bio: doctor.bio,
              clinicName: doctor.clinicName ?? "",
              clinicAddress: doctor.address.line1 ?? "",
              city: doctor.address.city === "—" ? "" : doctor.address.city,
              country: doctor.address.country === "—" ? "" : doctor.address.country,
              experienceYears: doctor.experienceYears,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
