import { prisma } from "@/lib/prisma";

/**
 * No-show risk scoring. A transparent, explainable heuristic (not a black box)
 * over each patient's history — the kind of signal the 2026 "AI scheduling"
 * tools surface. Returns a 0–100 score, a level, and the reasons, so the doctor
 * can send an extra reminder or require a deposit for high-risk visits.
 */
export type RiskLevel = "low" | "medium" | "high";

export interface RiskScore {
  score: number;
  level: RiskLevel;
  reasons: string[];
}

export async function noShowRisk(
  patientId: string,
  appointment: { appointmentDate: Date; createdAt: Date; isTelehealth: boolean },
): Promise<RiskScore> {
  const history = await prisma.appointment.findMany({
    where: { patientId, status: { in: ["completed", "no_show", "cancelled"] } },
    select: { status: true },
  });

  let score = 12; // small baseline risk
  const reasons: string[] = [];

  const noShows = history.filter((h) => h.status === "no_show").length;
  const cancels = history.filter((h) => h.status === "cancelled").length;
  const completed = history.filter((h) => h.status === "completed").length;

  if (noShows > 0) {
    score += Math.min(45, noShows * 25);
    reasons.push(`${noShows} previous no-show${noShows > 1 ? "s" : ""}`);
  }
  if (cancels > 1) {
    score += Math.min(15, cancels * 5);
    reasons.push(`${cancels} prior cancellations`);
  }
  if (completed === 0 && history.length === 0) {
    score += 10;
    reasons.push("First-time patient (no history)");
  } else if (completed >= 3 && noShows === 0) {
    score -= 12;
    reasons.push("Reliable history of attendance");
  }

  // Long lead time between booking and visit raises risk.
  const leadDays = Math.round(
    (appointment.appointmentDate.getTime() - appointment.createdAt.getTime()) / 86400000,
  );
  if (leadDays >= 14) {
    score += 12;
    reasons.push("Booked far in advance");
  }
  if (appointment.isTelehealth) {
    score += 5;
    reasons.push("Telehealth visits skip more often");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level: RiskLevel = score >= 60 ? "high" : score >= 35 ? "medium" : "low";
  if (reasons.length === 0) reasons.push("No risk signals");
  return { score, level, reasons };
}
