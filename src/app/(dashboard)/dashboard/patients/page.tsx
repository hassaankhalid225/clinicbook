import Link from "next/link";
import { Search, Users } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { patientService } from "@/modules/patients/patient.service";
import { formatDateOnly } from "@/lib/datetime";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const doctor = await requireDoctor();
  const { q } = await searchParams;
  const patients = await patientService.listForDoctor(doctor.id, q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          Everyone who has booked with you, with visit history.
        </p>
      </div>

      <form className="flex gap-2" action="/dashboard/patients">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, phone, or email"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Card>
        <CardContent className="pt-6">
          {patients.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 opacity-40" />
              <p>{q ? "No patients match your search." : "No patients yet."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>No-shows</TableHead>
                  <TableHead>Last visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/patients/${p.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{p.phone}</div>
                      {p.email && (
                        <div className="text-muted-foreground">{p.email}</div>
                      )}
                    </TableCell>
                    <TableCell>{p.visits}</TableCell>
                    <TableCell>
                      {p.noShows > 0 ? (
                        <Badge variant="destructive">{p.noShows}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.lastVisit ? formatDateOnly(p.lastVisit) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
