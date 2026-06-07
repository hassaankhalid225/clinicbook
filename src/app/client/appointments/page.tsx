import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { formatDate, money } from "@/core/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ApptStatusBadge } from "@/components/marketplace/appt-status-badge";
import { LeaveReview } from "@/components/marketplace/leave-review";
import type { Appointment } from "@/core/types";

function ApptTable({ rows }: { rows: Appointment[] }) {
  if (rows.length === 0)
    return <p className="py-10 text-center text-sm text-muted-foreground">Nothing here.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Doctor</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.doctorName}</TableCell>
            <TableCell>{a.serviceTitle}</TableCell>
            <TableCell>{formatDate(a.date)}</TableCell>
            <TableCell>{a.startTime}</TableCell>
            <TableCell>{money(a.priceCents)}</TableCell>
            <TableCell><ApptStatusBadge status={a.status} /></TableCell>
            <TableCell className="text-right">
              {a.status === "completed" && (
                <LeaveReview doctorId={a.doctorId} doctorName={a.doctorName ?? "your doctor"} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function ClientAppointmentsPage() {
  const appts = await repositories.appointments.listByClient(MOCK_CURRENT.clientId);
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = appts.filter((a) => a.date >= todayStr && ["pending", "confirmed"].includes(a.status));
  const past = appts.filter((a) => !(a.date >= todayStr && ["pending", "confirmed"].includes(a.status)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My appointments</h1>
        <p className="text-muted-foreground">Track your upcoming and past visits.</p>
      </div>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="history">History ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card><CardContent className="pt-6"><ApptTable rows={upcoming} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="history">
          <Card><CardContent className="pt-6"><ApptTable rows={past} /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
