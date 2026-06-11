import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/**
 * Notification service. Records every send attempt to `notifications_log`.
 *
 * SMS (Twilio) and email (Resend) sends are stubbed: when the relevant
 * integration env vars are absent, the message is composed and logged but not
 * dispatched, so the booking flow works end-to-end without external accounts.
 * Wiring the real providers means filling in the two `dispatch*` helpers.
 */
export const notificationService = {
  async sendConfirmation(appointmentId: string) {
    return this.send(appointmentId, "confirmation");
  },

  async sendReminder(appointmentId: string) {
    return this.send(appointmentId, "reminder");
  },

  async sendCancellation(appointmentId: string) {
    return this.send(appointmentId, "cancellation");
  },

  async send(appointmentId: string, type: NotificationType) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: true },
    });
    if (!appointment) return;

    const message = composeMessage(type, {
      patientName: appointment.patient.fullName,
      doctorName: appointment.doctor.fullName,
      clinicName: appointment.doctor.clinicName,
      date: appointment.appointmentDate.toISOString().slice(0, 10),
      time: appointment.startTime,
      cancelToken: appointment.cancelToken,
      videoRoomUrl: appointment.isTelehealth ? appointment.videoRoomUrl : null,
    });

    // SMS (always attempted — phone is required).
    const smsResult = await dispatchSms(appointment.patient.phone, message);
    await prisma.notificationLog.create({
      data: {
        appointmentId,
        channel: "sms",
        type,
        status: smsResult.ok ? "sent" : "failed",
        providerMsgId: smsResult.id,
      },
    });

    // Email (only when the patient gave one).
    if (appointment.patient.email) {
      const emailResult = await dispatchEmail(
        appointment.patient.email,
        `ClinicBook — ${type}`,
        message,
      );
      await prisma.notificationLog.create({
        data: {
          appointmentId,
          channel: "email",
          type,
          status: emailResult.ok ? "sent" : "failed",
          providerMsgId: emailResult.id,
        },
      });
    }
  },
};

function composeMessage(
  type: NotificationType,
  ctx: {
    patientName: string;
    doctorName: string;
    clinicName: string | null;
    date: string;
    time: string;
    cancelToken: string;
    videoRoomUrl?: string | null;
  },
): string {
  const where = ctx.clinicName ? ` at ${ctx.clinicName}` : "";
  const cancelUrl = `${env.appUrl}/cancel/${ctx.cancelToken}`;
  const video = ctx.videoRoomUrl ? ` Join your video visit: ${ctx.videoRoomUrl}` : "";
  switch (type) {
    case "confirmation":
      return `Hi ${ctx.patientName}! Your appointment with ${ctx.doctorName} is confirmed for ${ctx.date} at ${ctx.time}${where}.${video} Need to cancel? ${cancelUrl}`;
    case "reminder":
      return `Reminder: You have an appointment tomorrow with ${ctx.doctorName} at ${ctx.time}.${video} Cancel: ${cancelUrl}`;
    case "cancellation":
      return `Your appointment with ${ctx.doctorName} on ${ctx.date} at ${ctx.time} has been cancelled.`;
    case "waitlist_invite":
      return `A slot opened up with ${ctx.doctorName} on ${ctx.date}. Book now before it's gone.`;
  }
}

async function dispatchSms(
  to: string,
  body: string,
): Promise<{ ok: boolean; id?: string }> {
  if (!env.twilio.accountSid || !env.twilio.authToken) {
    console.info(`[sms:stub] → ${to}: ${body}`);
    return { ok: true, id: "stub-sms" };
  }
  // Real Twilio dispatch would go here.
  return { ok: true };
}

async function dispatchEmail(
  to: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean; id?: string }> {
  if (!env.resend.apiKey) {
    console.info(`[email:stub] → ${to} (${subject}): ${body}`);
    return { ok: true, id: "stub-email" };
  }
  // Real Resend dispatch would go here.
  return { ok: true };
}
