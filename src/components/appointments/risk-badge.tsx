import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/modules/analytics/risk.service";

const MAP: Record<RiskLevel, { label: string; variant: "muted" | "warning" | "destructive" }> = {
  low: { label: "Low risk", variant: "muted" },
  medium: { label: "Med risk", variant: "warning" },
  high: { label: "High risk", variant: "destructive" },
};

/** No-show risk pill. Reasons are exposed via the native title tooltip. */
export function RiskBadge({
  level,
  score,
  reasons,
}: {
  level: RiskLevel;
  score: number;
  reasons: string[];
}) {
  if (level === "low") return null; // only surface medium/high to reduce noise
  const { label, variant } = MAP[level];
  return (
    <Badge variant={variant} className="gap-1" title={`No-show risk ${score}/100 · ${reasons.join("; ")}`}>
      <AlertTriangle className="h-3 w-3" />
      {label}
    </Badge>
  );
}
