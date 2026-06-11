import { Video } from "lucide-react";
import { formatDateOnly } from "@/lib/datetime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { AppointmentActions } from "./appointment-actions";

export interface AppointmentRow {
  id: string;
  appointmentDate: Date;
  startTime: string;
  reason: string | null;
  isTelehealth: boolean;
  videoRoomUrl?: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  patient: { fullName: string; phone: string; email: string | null };
}

export function AppointmentTable({
  appointments,
  emptyLabel = "No appointments.",
}: {
  appointments: AppointmentRow[];
  emptyLabel?: string;
}) {
  if (appointments.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((a) => (
          <TableRow key={a.id}>
            <TableCell>{formatDateOnly(a.appointmentDate)}</TableCell>
            <TableCell className="font-medium">{a.startTime}</TableCell>
            <TableCell>
              <div className="font-medium">{a.patient.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {a.patient.phone}
              </div>
            </TableCell>
            <TableCell className="max-w-[220px] truncate">
              {a.reason ?? "—"}
              {a.isTelehealth && (
                <span className="ml-1 text-xs text-primary">· Telehealth</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={a.status} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {a.isTelehealth && a.videoRoomUrl && a.status === "scheduled" && (
                  <a
                    href={a.videoRoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1 rounded-md border border-primary px-3 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <Video className="h-4 w-4" /> Join
                  </a>
                )}
                <AppointmentActions appointmentId={a.id} status={a.status} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
