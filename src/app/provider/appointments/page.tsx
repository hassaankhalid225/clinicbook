import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { formatDate, money } from "@/core/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ApptStatusBadge } from "@/components/marketplace/appt-status-badge";
import { ApptActions } from "@/components/marketplace/appt-actions";

export default async function ProviderAppointmentsPage() {
  const appts = await repositories.appointments.listByDoctor(MOCK_CURRENT.doctorId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Manage and update every booking.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {appts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{formatDate(a.date)}</TableCell>
                    <TableCell className="font-medium">{a.startTime}</TableCell>
                    <TableCell>{a.clientName}</TableCell>
                    <TableCell>{a.serviceTitle}</TableCell>
                    <TableCell>{money(a.priceCents)}</TableCell>
                    <TableCell><ApptStatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-right">
                      <ApptActions id={a.id} status={a.status} />
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
