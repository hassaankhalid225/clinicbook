import { prisma } from "@/lib/prisma";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { parseDateOnly, formatDateOnly } from "@/lib/datetime";

/**
 * Daily queue / token management ("rush" view).
 * Tokens are issued per doctor per day: 1, 2, 3…  An entry comes from either
 * checking-in a booked appointment or adding a walk-in.
 */
export const queueService = {
  async board(doctorId: string, dateStr?: string) {
    const date = parseDateOnly(dateStr ?? formatDateOnly(new Date()));
    const [entries, appts] = await Promise.all([
      prisma.queueEntry.findMany({
        where: { doctorId, date },
        orderBy: { tokenNumber: "asc" },
      }),
      prisma.appointment.findMany({
        where: { doctorId, appointmentDate: date, status: { in: ["scheduled", "completed"] } },
        include: { patient: { select: { fullName: true } } },
        orderBy: { startTime: "asc" },
      }),
    ]);

    const queuedApptIds = new Set(entries.map((e) => e.appointmentId).filter(Boolean));
    const waiting = entries.filter((e) => e.status === "waiting");
    const inProgress = entries.find((e) => e.status === "in_progress") ?? null;
    const completed = entries.filter((e) => e.status === "completed");

    // Average consultation time today (completed entries with timestamps).
    const durations = completed
      .filter((e) => e.startedAt && e.completedAt)
      .map((e) => (e.completedAt!.getTime() - e.startedAt!.getTime()) / 60000);
    const avgMinutes = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    return {
      date: formatDateOnly(date),
      entries,
      nowServing: inProgress,
      waitingCount: waiting.length,
      completedCount: completed.length,
      avgMinutes,
      estimatedWaitMinutes: avgMinutes != null ? avgMinutes * waiting.length : null,
      checkInCandidates: appts
        .filter((a) => !queuedApptIds.has(a.id) && a.status === "scheduled")
        .map((a) => ({
          id: a.id,
          time: a.startTime,
          patientName: a.patient.fullName,
        })),
      rushByHour: appts.reduce<Record<string, number>>((acc, a) => {
        const h = a.startTime.slice(0, 2) + ":00";
        acc[h] = (acc[h] ?? 0) + 1;
        return acc;
      }, {}),
    };
  },

  /** Check in a booked appointment or a walk-in; issues the next token. */
  async checkIn(
    doctorId: string,
    input: { appointmentId?: string; patientName?: string; dateStr?: string },
  ) {
    const date = parseDateOnly(input.dateStr ?? formatDateOnly(new Date()));
    let patientName = input.patientName?.trim() ?? "";

    if (input.appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { id: input.appointmentId },
        include: { patient: true },
      });
      if (!appt) throw new NotFoundError("Appointment not found");
      if (appt.doctorId !== doctorId) throw new ForbiddenError();
      const dup = await prisma.queueEntry.findUnique({
        where: { appointmentId: appt.id },
      });
      if (dup) throw new AppError("Already checked in", 409);
      patientName = appt.patient.fullName;
    }
    if (!patientName) throw new AppError("Patient name is required", 400);

    // Next token with retry against concurrent check-ins.
    for (let attempt = 0; attempt < 3; attempt++) {
      const max = await prisma.queueEntry.aggregate({
        where: { doctorId, date },
        _max: { tokenNumber: true },
      });
      try {
        return await prisma.queueEntry.create({
          data: {
            doctorId,
            date,
            tokenNumber: (max._max.tokenNumber ?? 0) + 1 + attempt,
            appointmentId: input.appointmentId,
            patientName,
          },
        });
      } catch (err) {
        if (attempt === 2) throw err;
      }
    }
    throw new Error("unreachable");
  },

  /** start | complete | skip | cancel transitions. */
  async transition(doctorId: string, entryId: string, action: string) {
    const entry = await prisma.queueEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundError("Queue entry not found");
    if (entry.doctorId !== doctorId) throw new ForbiddenError();

    switch (action) {
      case "start": {
        // Only one patient in the room at a time: finish any current one.
        await prisma.queueEntry.updateMany({
          where: { doctorId, date: entry.date, status: "in_progress" },
          data: { status: "completed", completedAt: new Date() },
        });
        return prisma.queueEntry.update({
          where: { id: entryId },
          data: { status: "in_progress", startedAt: new Date() },
        });
      }
      case "complete":
        return prisma.queueEntry.update({
          where: { id: entryId },
          data: { status: "completed", completedAt: new Date() },
        });
      case "skip":
        return prisma.queueEntry.update({
          where: { id: entryId },
          data: { status: "skipped" },
        });
      case "cancel":
        return prisma.queueEntry.update({
          where: { id: entryId },
          data: { status: "cancelled" },
        });
      default:
        throw new AppError("Unknown queue action", 400);
    }
  },
};
