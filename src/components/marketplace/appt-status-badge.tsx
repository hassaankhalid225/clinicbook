import type { AppointmentStatus } from "@/core/types";
import { Badge } from "@/components/ui/badge";

const MAP: Record<AppointmentStatus, { label: string; variant: "info" | "success" | "muted" | "destructive" | "warning" | "secondary" }> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  rescheduled: { label: "Rescheduled", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "muted" },
  no_show: { label: "No-show", variant: "destructive" },
};

export function ApptStatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
