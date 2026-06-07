import { prisma } from "@/lib/prisma";
import {
  addMinutes,
  dayOfWeek,
  parseDateOnly,
  rangesOverlap,
  toMinutes,
} from "@/lib/datetime";

export interface SlotComputation {
  date: string;
  slots: string[]; // available "HH:mm" start times
  slotDurationMin: number;
}

/**
 * Computes the truly-available booking slots for a doctor on a given date by:
 *  1. Reading the weekly availability rule for that weekday.
 *  2. Generating candidate slots of `slotDurationMin`, excluding the lunch break.
 *  3. Removing slots that overlap a blocked range (or all, on a full-day block).
 *  4. Removing slots already taken by a non-cancelled appointment.
 */
export async function computeAvailableSlots(
  doctorId: string,
  date: string,
): Promise<SlotComputation> {
  const dow = dayOfWeek(date);

  const rule = await prisma.availabilityRule.findUnique({
    where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: dow } },
  });

  if (!rule || !rule.isActive) {
    return { date, slots: [], slotDurationMin: rule?.slotDurationMin ?? 30 };
  }

  const duration = rule.slotDurationMin;
  const dayStart = toMinutes(rule.startTime);
  const dayEnd = toMinutes(rule.endTime);
  const breakStart = rule.breakStart ? toMinutes(rule.breakStart) : null;
  const breakEnd = rule.breakEnd ? toMinutes(rule.breakEnd) : null;

  // 1. Candidate slots within the working window, skipping the break.
  const candidates: string[] = [];
  for (let t = dayStart; t + duration <= dayEnd; t += duration) {
    const slotEnd = t + duration;
    if (
      breakStart != null &&
      breakEnd != null &&
      rangesOverlap(t, slotEnd, breakStart, breakEnd)
    ) {
      continue;
    }
    candidates.push(addMinutes("00:00", t));
  }

  if (candidates.length === 0) {
    return { date, slots: [], slotDurationMin: duration };
  }

  const dateObj = parseDateOnly(date);

  // 2. Blocked ranges for the date.
  const blocks = await prisma.blockedSlot.findMany({
    where: { doctorId, blockedDate: dateObj },
  });
  const fullDayBlocked = blocks.some((b) => !b.startTime || !b.endTime);
  if (fullDayBlocked) {
    return { date, slots: [], slotDurationMin: duration };
  }
  const blockRanges = blocks
    .filter((b) => b.startTime && b.endTime)
    .map((b) => [toMinutes(b.startTime!), toMinutes(b.endTime!)] as const);

  // 3. Taken slots (scheduled/completed appointments).
  const taken = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: dateObj,
      status: { in: ["scheduled", "completed", "no_show"] },
    },
    select: { startTime: true },
  });
  const takenSet = new Set(taken.map((a) => a.startTime));

  const slots = candidates.filter((slot) => {
    if (takenSet.has(slot)) return false;
    const s = toMinutes(slot);
    const e = s + duration;
    return !blockRanges.some(([bs, be]) => rangesOverlap(s, e, bs, be));
  });

  return { date, slots, slotDurationMin: duration };
}
