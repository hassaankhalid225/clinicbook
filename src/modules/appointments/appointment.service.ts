import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { parseDateOnly, formatDateOnly } from "@/lib/datetime";
import type {
  ListAppointmentsInput,
  UpdateStatusInput,
} from "./appointment.schema";

const withPatient = {
  patient: { select: { fullName: true, phone: true, email: true } },
} satisfies Prisma.AppointmentInclude;

/** Doctor-facing appointment management. All reads are scoped to the doctor. */
export const appointmentService = {
  async list(doctorId: string, filter: ListAppointmentsInput) {
    const where: Prisma.AppointmentWhereInput = { doctorId };
    if (filter.status) where.status = filter.status;
    if (filter.from || filter.to) {
      where.appointmentDate = {};
      if (filter.from) where.appointmentDate.gte = parseDateOnly(filter.from);
      if (filter.to) where.appointmentDate.lte = parseDateOnly(filter.to);
    }
    return prisma.appointment.findMany({
      where,
      include: withPatient,
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });
  },

  async listToday(doctorId: string) {
    const today = parseDateOnly(formatDateOnly(new Date()));
    const appointments = await prisma.appointment.findMany({
      where: { doctorId, appointmentDate: today },
      include: withPatient,
      orderBy: { startTime: "asc" },
    });
    return { date: formatDateOnly(today), count: appointments.length, appointments };
  },

  async listUpcoming(doctorId: string, days = 7) {
    const start = parseDateOnly(formatDateOnly(new Date()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + days);
    return prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: start, lte: end },
        status: { in: ["scheduled"] },
      },
      include: withPatient,
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });
  },

  async updateStatus(
    doctorId: string,
    appointmentId: string,
    input: UpdateStatusInput,
  ) {
    await this.assertOwned(doctorId, appointmentId);
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: input.status },
      include: withPatient,
    });
  },

  async updateNotes(doctorId: string, appointmentId: string, notes: string) {
    await this.assertOwned(doctorId, appointmentId);
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes },
    });
  },

  async assertOwned(doctorId: string, appointmentId: string) {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true },
    });
    if (!appt) throw new NotFoundError("Appointment not found");
    if (appt.doctorId !== doctorId) throw new ForbiddenError();
  },
};
