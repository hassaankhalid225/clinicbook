import type { AppointmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const MAP: Record<
  AppointmentStatus,
  { label: string; variant: "info" | "success" | "muted" | "destructive" | "warning" }
> = {
  scheduled: { label: "Scheduled", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "muted" },
  no_show: { label: "No-show", variant: "destructive" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
