import { requireDoctor } from "@/lib/auth";
import { waitlistService } from "@/modules/waitlist/waitlist.service";
import { formatDateOnly } from "@/lib/datetime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WaitlistActions } from "@/components/waitlist/waitlist-actions";

export default async function WaitlistPage() {
  const doctor = await requireDoctor();
  const entries = await waitlistService.list(doctor.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Waitlist</h1>
        <p className="text-muted-foreground">
          Patients waiting for a slot. When one cancels, invite the next in line.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {entries.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No one on the waitlist right now.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Preferred date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{e.patient.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.patient.phone}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateOnly(e.preferredDate)}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === "invited" ? "info" : "muted"}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateOnly(e.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <WaitlistActions id={e.id} status={e.status} />
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
