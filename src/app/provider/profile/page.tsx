import { User, Sparkles } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { ProfileForm } from "@/components/provider/profile-form";
import { ExpertiseEditor } from "@/components/provider/expertise-editor";

export default async function ProviderProfilePage() {
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return null;
  const e = doctor.expertise;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Your public profile at{" "}
          <span className="font-mono text-primary">/doctor/{doctor.username}</span>.
          Click a section to expand and edit.
        </p>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <Accordion type="multiple" defaultValue={["basic"]}>
            <AccordionItem value="basic">
              <AccordionTrigger className="px-2 text-base">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Basic Information
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pt-2">
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="expertise" className="border-b-0">
              <AccordionTrigger className="px-2 text-base">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Expertise
                  <span className="text-sm font-normal text-muted-foreground">
                    ({e.subSpecialties.length + e.skills.length + e.procedures.length} tags)
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pt-2">
                <ExpertiseEditor
                  initial={{
                    subSpecialties: e.subSpecialties,
                    skills: e.skills,
                    procedures: e.procedures,
                    certifications: doctor.certifications,
                    languages: doctor.languages,
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
