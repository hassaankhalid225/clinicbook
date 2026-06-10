import { Users, Timer, CheckCircle2, Activity } from "lucide-react";
import { requireDoctor } from "@/lib/auth";
import { queueService } from "@/modules/queue/queue.service";
import { moduleService } from "@/modules/billing/module.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HourBars } from "@/components/analytics/report-charts";
import { QueueBoard } from "@/components/queue/queue-board";
import Link from "next/link";

export default async function QueuePage() {
  const doctor = await requireDoctor();
  const hasQueue = await moduleService.hasModule(doctor.id, "queue");

  if (!hasQueue) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-bold">Queue module not active</h1>
        <p className="mt-2 text-muted-foreground">
          Manage daily rush with token numbers, walk-ins, and live wait estimates.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/modules">Enable the Queue module</Link>
        </Button>
      </div>
    );
  }

  const board = await queueService.board(doctor.id);
  const rushData = Object.entries(board.rushByHour)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({ hour, count }));

  const stats = [
    { label: "Now serving", value: board.nowServing ? `#${board.nowServing.tokenNumber}` : "—", icon: Activity },
    { label: "Waiting", value: board.waitingCount, icon: Users },
    { label: "Completed", value: board.completedCount, icon: CheckCircle2 },
    {
      label: "Est. wait",
      value: board.estimatedWaitMinutes != null ? `${board.estimatedWaitMinutes} min` : "—",
      icon: Timer,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Today&apos;s queue</h1>
        <p className="text-muted-foreground">
          {board.date} — tokens, walk-ins, and the daily rush at a glance.
        </p>
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

      <QueueBoard
        entries={board.entries.map((e) => ({
          id: e.id,
          tokenNumber: e.tokenNumber,
          patientName: e.patientName,
          status: e.status,
        }))}
        candidates={board.checkInCandidates}
      />

      {rushData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s rush by hour</CardTitle>
          </CardHeader>
          <CardContent>
            <HourBars data={rushData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
