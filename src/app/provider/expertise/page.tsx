import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function ProviderExpertisePage() {
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return null;
  const e = doctor.expertise;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expertise</h1>
        <p className="text-muted-foreground">
          Help patients find you — these power discovery filters.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Specialty</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Label>Primary specialty</Label>
          <Input defaultValue={e.specialty} />
        </CardContent>
      </Card>

      <ChipCard title="Sub-specialties" items={e.subSpecialties} />
      <ChipCard title="Skills" items={e.skills} />
      <ChipCard title="Procedures" items={e.procedures} />

      <div className="flex justify-end"><Button>Save expertise</Button></div>
    </div>
  );
}

function ChipCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">None added yet.</p>
        ) : (
          items.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)
        )}
      </CardContent>
    </Card>
  );
}
