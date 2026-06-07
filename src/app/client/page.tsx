import Link from "next/link";
import { CalendarDays, Heart, History, Bookmark } from "lucide-react";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { formatDate, money } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApptStatusBadge } from "@/components/marketplace/appt-status-badge";
import { DoctorCard } from "@/components/marketplace/doctor-card";

export default async function ClientDashboard() {
  const clientId = MOCK_CURRENT.clientId;
  const [client, appts] = await Promise.all([
    repositories.clients.getById(clientId),
    repositories.appointments.listByClient(clientId),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = appts.filter((a) => a.date >= todayStr && ["pending", "confirmed"].includes(a.status));
  const history = appts.filter((a) => a.date < todayStr || ["completed", "cancelled", "no_show"].includes(a.status));

  const favorites = (await Promise.all((client?.favoriteDoctorIds ?? []).map((id) => repositories.doctors.getById(id)))).filter(Boolean);

  const stats = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
    { label: "Past visits", value: history.length, icon: History },
    { label: "Favorites", value: client?.favoriteDoctorIds.length ?? 0, icon: Heart },
    { label: "Saved", value: client?.savedDoctorIds.length ?? 0, icon: Bookmark },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi, {client?.fullName.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Your appointments and favorite doctors.</p>
        </div>
        <Button asChild><Link href="/doctors">Book a doctor</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-7 w-7 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Upcoming appointments</CardTitle></CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming appointments. <Link href="/doctors" className="text-primary hover:underline">Find a doctor</Link>.
            </p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{a.doctorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.serviceTitle} · {formatDate(a.date)} at {a.startTime} · {money(a.priceCents)}
                    </p>
                  </div>
                  <ApptStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {favorites.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Your favorite doctors</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((d) => d && <DoctorCard key={d.id} doctor={d} />)}
          </div>
        </div>
      )}
    </div>
  );
}
