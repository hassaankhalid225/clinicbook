import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";
import { formatDate } from "@/core/utils/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function ProviderAvailabilityPage() {
  const [rules, blocks] = await Promise.all([
    repositories.availability.rulesByDoctor(MOCK_CURRENT.doctorId),
    repositories.availability.blocksByDoctor(MOCK_CURRENT.doctorId),
  ]);
  const byDay = new Map(rules.map((r) => [r.dayOfWeek, r]));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">Set your weekly hours and block days off.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly hours</CardTitle>
          <CardDescription>No overlapping slots — handled automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DAYS.map((name, day) => {
            const r = byDay.get(day);
            return (
              <div key={day} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Switch defaultChecked={Boolean(r?.isActive)} />
                  <span className="w-24 font-medium">{name}</span>
                </div>
                {r?.isActive ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{r.startTime}–{r.endTime}</Badge>
                    <Badge variant="muted">{r.slotDurationMin}m slots</Badge>
                    {r.breakStart && <Badge variant="secondary">Lunch {r.breakStart}–{r.breakEnd}</Badge>}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked dates &amp; holidays</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked dates.</p>
          ) : (
            blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{formatDate(b.date)} {b.reason && `· ${b.reason}`}</span>
                <Button variant="ghost" size="sm">Remove</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
