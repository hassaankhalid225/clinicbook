import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

/**
 * Patient CRM service. A doctor's "patients" are the distinct people who have
 * booked at least one appointment with them. All access is scoped to the doctor.
 */
export const patientService = {
  /** Lists the doctor's patients with visit count + last visit, searchable. */
  async listForDoctor(doctorId: string, query?: string) {
    const patients = await prisma.patient.findMany({
      where: {
        appointments: { some: { doctorId } },
        ...(query
          ? {
              OR: [
                { fullName: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        appointments: {
          where: { doctorId },
          orderBy: { appointmentDate: "desc" },
          select: { appointmentDate: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return patients.map((p) => {
      const visits = p.appointments.length;
      const completed = p.appointments.filter((a) => a.status === "completed").length;
      const noShows = p.appointments.filter((a) => a.status === "no_show").length;
      return {
        id: p.id,
        fullName: p.fullName,
        phone: p.phone,
        email: p.email,
        visits,
        completed,
        noShows,
        lastVisit: p.appointments[0]?.appointmentDate ?? null,
      };
    });
  },

  /** Full patient profile + their appointment history with this doctor. */
  async getForDoctor(doctorId: string, patientId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, appointments: { some: { doctorId } } },
      include: {
        appointments: {
          where: { doctorId },
          orderBy: [{ appointmentDate: "desc" }, { startTime: "desc" }],
          include: { service: { select: { name: true } } },
        },
      },
    });
    if (!patient) throw new NotFoundError("Patient not found");
    return patient;
  },
};
