import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { addMinutes, parseDateOnly, formatDateOnly } from "@/lib/datetime";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { getPlan } from "@/modules/billing/plans";
import { notificationService } from "@/modules/notifications/notification.service";
import { videoRoomUrl } from "@/lib/video";
import { computeAvailableSlots } from "./slots.service";
import type { CreateBookingInput, JoinWaitlistInput } from "./booking.schema";

export const bookingService = {
  /**
   * Books a slot for a patient on a doctor's public page (no auth).
   *  - Enforces the doctor's daily booking limit (plan gating).
   *  - Verifies the requested slot is actually available.
   *  - Creates/links the patient and writes the appointment.
   *  - The DB unique constraint (doctorId, date, startTime) is the final guard
   *    against a race where two patients grab the same slot.
   */
  async createBooking(slug: string, input: CreateBookingInput) {
    const doctor = await prisma.doctor.findUnique({ where: { slug } });
    if (!doctor || !doctor.isActive) throw new NotFoundError("Doctor not found");

    const dateObj = parseDateOnly(input.date);

    // Plan gating: free plan caps bookings per day.
    const limit = getPlan(doctor.plan).dailyBookingLimit;
    if (limit != null) {
      const count = await prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: dateObj,
          status: { in: ["scheduled", "completed"] },
        },
      });
      if (count >= limit) {
        throw new AppError(
          "This doctor has reached the maximum bookings for that day. Please try another date or join the waitlist.",
          409,
          "daily_limit_reached",
        );
      }
    }

    // Verify the slot is genuinely available right now.
    const { slots, slotDurationMin } = await computeAvailableSlots(
      doctor.id,
      input.date,
    );
    if (!slots.includes(input.time)) {
      throw new ConflictError("That time slot is no longer available");
    }

    const endTime = addMinutes(input.time, slotDurationMin);

    // Optional paid service attached to the booking (price/title for payment).
    let service = null;
    if (input.serviceId) {
      service = await prisma.service.findFirst({
        where: { id: input.serviceId, doctorId: doctor.id, isActive: true },
      });
    }

    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const patient = await tx.patient.create({
          data: {
            fullName: input.patientName,
            phone: input.phone,
            email: input.email || null,
          },
        });

        return tx.appointment.create({
          data: {
            doctorId: doctor.id,
            patientId: patient.id,
            serviceId: service?.id ?? null,
            appointmentDate: dateObj,
            startTime: input.time,
            endTime,
            reason: input.reason,
            isTelehealth: input.isTelehealth ?? false,
          },
          include: { patient: true },
        });
      });

      // Telehealth → generate a video room for the visit.
      let videoUrl = appointment.videoRoomUrl;
      if (appointment.isTelehealth) {
        videoUrl = videoRoomUrl(appointment.id);
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { videoRoomUrl: videoUrl },
        });
      }

      // Fire-and-forget confirmation (logged; real send when integrations set).
      await notificationService.sendConfirmation(appointment.id).catch(() => {});

      return {
        appointmentId: appointment.id,
        status: appointment.status,
        cancelToken: appointment.cancelToken,
        videoUrl,
        date: input.date,
        time: input.time,
        doctorName: doctor.fullName,
        amountCents: service?.priceCents ?? 0,
        currency: doctor.currency ?? "USD",
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("That time slot was just taken");
      }
      throw err;
    }
  },

  /** Patient self-service: find upcoming appointments by phone number. */
  async lookupByPhone(phone: string) {
    const today = parseDateOnly(formatDateOnly(new Date()));
    const appts = await prisma.appointment.findMany({
      where: {
        patient: { phone },
        appointmentDate: { gte: today },
        status: { in: ["scheduled"] },
      },
      include: { doctor: { select: { fullName: true, clinicName: true } } },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
      take: 50,
    });
    return appts.map((a) => ({
      date: formatDateOnly(a.appointmentDate),
      time: a.startTime,
      status: a.status,
      isTelehealth: a.isTelehealth,
      videoRoomUrl: a.videoRoomUrl,
      doctorName: a.doctor.fullName,
      clinicName: a.doctor.clinicName,
      cancelToken: a.cancelToken,
    }));
  },

  /** Public lookup of an appointment by its token (for the reschedule page). */
  async getByToken(token: string) {
    const appt = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { doctor: { select: { slug: true, fullName: true, clinicName: true } } },
    });
    if (!appt) return null;
    return {
      id: appt.id,
      status: appt.status,
      date: formatDateOnly(appt.appointmentDate),
      time: appt.startTime,
      isTelehealth: appt.isTelehealth,
      doctorSlug: appt.doctor.slug,
      doctorName: appt.doctor.fullName,
      clinicName: appt.doctor.clinicName,
    };
  },

  /** Reschedules an appointment to a new date/time via its token (no auth). */
  async rescheduleByToken(token: string, date: string, time: string) {
    const appt = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { doctor: true },
    });
    if (!appt) throw new NotFoundError("Appointment not found");
    if (appt.status === "cancelled") {
      throw new ConflictError("This appointment was cancelled");
    }

    const { slots, slotDurationMin } = await computeAvailableSlots(
      appt.doctorId,
      date,
    );
    if (!slots.includes(time)) {
      throw new ConflictError("That time slot is no longer available");
    }

    try {
      const updated = await prisma.appointment.update({
        where: { id: appt.id },
        data: {
          appointmentDate: parseDateOnly(date),
          startTime: time,
          endTime: addMinutes(time, slotDurationMin),
        },
      });
      await notificationService.sendConfirmation(updated.id).catch(() => {});
      return { rescheduled: true, date, time };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("That time slot was just taken");
      }
      throw err;
    }
  },

  /** Cancels an appointment via its one-click cancel token (no auth). */
  async cancelByToken(token: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { doctor: true },
    });
    if (!appointment) throw new NotFoundError("Appointment not found");
    if (appointment.status === "cancelled") {
      return { cancelled: true, alreadyCancelled: true };
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "cancelled" },
    });

    await notificationService.sendCancellation(appointment.id).catch(() => {});

    // Notify the next matching waitlist patient if any.
    const waitlistNotified = await this.notifyNextWaitlist(
      appointment.doctorId,
      appointment.appointmentDate,
    );

    return { cancelled: true, waitlistNotified };
  },

  /** Patient joins the waitlist for a doctor on a preferred date. */
  async joinWaitlist(slug: string, input: JoinWaitlistInput) {
    const doctor = await prisma.doctor.findUnique({ where: { slug } });
    if (!doctor || !doctor.isActive) throw new NotFoundError("Doctor not found");

    const entry = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: { fullName: input.patientName, phone: input.phone },
      });
      return tx.waitlist.create({
        data: {
          doctorId: doctor.id,
          patientId: patient.id,
          preferredDate: parseDateOnly(input.preferredDate),
        },
      });
    });

    const position = await prisma.waitlist.count({
      where: {
        doctorId: doctor.id,
        preferredDate: parseDateOnly(input.preferredDate),
        status: "waiting",
        createdAt: { lte: entry.createdAt },
      },
    });

    return { waitlistId: entry.id, position };
  },

  /** Invites the earliest waiting patient for a date when a slot frees up. */
  async notifyNextWaitlist(doctorId: string, date: Date): Promise<boolean> {
    const next = await prisma.waitlist.findFirst({
      where: { doctorId, preferredDate: date, status: "waiting" },
      orderBy: { createdAt: "asc" },
    });
    if (!next) return false;

    await prisma.waitlist.update({
      where: { id: next.id },
      data: { status: "invited" },
    });
    return true;
  },
};
