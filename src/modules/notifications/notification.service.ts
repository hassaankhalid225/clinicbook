import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { buildIcs } from "@/lib/ics";

interface EmailAttachment {
  filename: string;
  content: string; // base64
  contentType?: string;
}

/**
 * Notification service. Records every send attempt to `notifications_log`.
 *
 * SMS (Twilio) and email (Resend) are dispatched via each provider's REST API
 * when keys are configured; without keys the message is composed and logged
 * (mock mode), so every flow works end-to-end with no external accounts.
 * Paste the Twilio/Resend keys into .env and real delivery turns on — no code
 * change needed.
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
      // Attach a calendar invite to confirmations.
      let attachments: EmailAttachment[] | undefined;
      if (type === "confirmation") {
        const ics = buildIcs({
          uid: appointment.id,
          date: appointment.appointmentDate.toISOString().slice(0, 10),
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          summary: `Appointment with ${appointment.doctor.fullName}`,
          description: appointment.isTelehealth && appointment.videoRoomUrl
            ? `Telehealth visit. Join: ${appointment.videoRoomUrl}`
            : appointment.reason ?? "",
          location: appointment.isTelehealth
            ? appointment.videoRoomUrl ?? "Online"
            : appointment.doctor.clinicAddress ?? appointment.doctor.clinicName ?? "",
        });
        attachments = [
          {
            filename: "appointment.ics",
            content: Buffer.from(ics).toString("base64"),
            contentType: "text/calendar",
          },
        ];
      }
      const emailResult = await dispatchEmail(
        appointment.patient.email,
        `ClinicBook — ${type}`,
        message,
        attachments,
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

/** Sends an SMS via the Twilio REST API. Mock-logs when keys are absent. */
async function dispatchSms(
  to: string,
  body: string,
): Promise<{ ok: boolean; id?: string }> {
  const { accountSid, authToken, fromNumber } = env.twilio;
  if (!accountSid || !authToken || !fromNumber) {
    console.info(`[sms:mock] → ${to}: ${body}`);
    return { ok: true, id: "mock-sms" };
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
      },
    );
    const json = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) console.error("[sms:twilio] failed:", json.message);
    return { ok: res.ok, id: json.sid };
  } catch (err) {
    console.error("[sms:twilio] error:", err);
    return { ok: false };
  }
}

/** Sends an email via the Resend REST API. Mock-logs when the key is absent. */
async function dispatchEmail(
  to: string,
  subject: string,
  body: string,
  attachments?: EmailAttachment[],
): Promise<{ ok: boolean; id?: string }> {
  if (!env.resend.apiKey) {
    console.info(`[email:mock] → ${to} (${subject}): ${body}`);
    return { ok: true, id: "mock-email" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resend.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.resend.from,
        to,
        subject,
        text: body,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          content_type: a.contentType,
        })),
      }),
    });
    const json = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) console.error("[email:resend] failed:", json.message);
    return { ok: res.ok, id: json.id };
  } catch (err) {
    console.error("[email:resend] error:", err);
    return { ok: false };
  }
}
