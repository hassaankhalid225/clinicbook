import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

/** Printable patient receipts, numbered RCP-YYYY-NNNN per year. */
export const receiptService = {
  async createForAppointment(appointmentId: string, paymentId?: string) {
    const existing = await prisma.receipt.findUnique({ where: { appointmentId } });
    if (existing) return existing;

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: true, service: true },
    });
    if (!appt) throw new NotFoundError("Appointment not found");

    const amount = appt.service?.priceCents ?? 0;
    const year = new Date().getFullYear();
    const count = await prisma.receipt.count({
      where: { receiptNumber: { startsWith: `RCP-${year}-` } },
    });

    // Retry on the (rare) concurrent-number collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      const receiptNumber = `RCP-${year}-${String(count + 1 + attempt).padStart(5, "0")}`;
      try {
        return await prisma.receipt.create({
          data: {
            receiptNumber,
            appointmentId,
            paymentId,
            doctorId: appt.doctorId,
            patientName: appt.patient.fullName,
            items: [
              {
                label: appt.service?.name ?? "Consultation",
                amountCents: amount,
              },
            ],
            subtotalCents: amount,
            totalCents: amount,
            currency: appt.doctor.currency ?? "USD",
            paymentStatus: appt.paymentStatus,
          },
        });
      } catch (err) {
        if (attempt === 2) throw err;
      }
    }
    throw new Error("unreachable");
  },

  /** Public fetch by unguessable id — used by the printable page. */
  getById(id: string) {
    return prisma.receipt.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            fullName: true,
            clinicName: true,
            clinicAddress: true,
            phone: true,
            specialty: true,
          },
        },
        appointment: {
          select: { appointmentDate: true, startTime: true, isTelehealth: true },
        },
      },
    });
  },

  listForDoctor(doctorId: string) {
    return prisma.receipt.findMany({
      where: { doctorId },
      orderBy: { issuedAt: "desc" },
      take: 100,
    });
  },
};
