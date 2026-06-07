import { requireDoctor } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { formatDateOnly } from "@/lib/datetime";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AppointmentTable,
  type AppointmentRow,
} from "@/components/appointments/appointment-table";

export default async function AppointmentsPage() {
  const doctor = await requireDoctor();
  const all = (await appointmentService.list(doctor.id, {})) as AppointmentRow[];

  const todayStr = formatDateOnly(new Date());
  const upcoming = all.filter(
    (a) =>
      formatDateOnly(a.appointmentDate) >= todayStr &&
      a.status === "scheduled",
  );
  const past = all.filter(
    (a) =>
      formatDateOnly(a.appointmentDate) < todayStr || a.status !== "scheduled",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Manage every booking across your calendar.
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card>
            <CardContent className="pt-6">
              <AppointmentTable
                appointments={upcoming}
                emptyLabel="No upcoming appointments."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past">
          <Card>
            <CardContent className="pt-6">
              <AppointmentTable
                appointments={past}
                emptyLabel="No past appointments yet."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              <AppointmentTable appointments={all} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
