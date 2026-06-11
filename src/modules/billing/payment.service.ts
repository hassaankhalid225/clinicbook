import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AppError, NotFoundError } from "@/lib/errors";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { receiptService } from "@/modules/receipts/receipt.service";

/** Patient-facing payment for a booked appointment (via its cancel token). */
export const paymentService = {
  /** Appointment summary for the /pay/[token] page. */
  async paySummary(token: string) {
    const appt = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: {
        doctor: { select: { fullName: true, clinicName: true, currency: true } },
        service: { select: { name: true, priceCents: true } },
        patient: { select: { fullName: true } },
      },
    });
    if (!appt) return null;
    return {
      token,
      doctorName: appt.doctor.fullName,
      clinicName: appt.doctor.clinicName,
      patientName: appt.patient.fullName,
      date: appt.appointmentDate.toISOString().slice(0, 10),
      time: appt.startTime,
      serviceTitle: appt.service?.name ?? "Consultation",
      amountCents: appt.service?.priceCents ?? 0,
      currency: appt.doctor.currency ?? "USD",
      paymentStatus: appt.paymentStatus,
      status: appt.status,
      isTelehealth: appt.isTelehealth,
      videoRoomUrl: appt.videoRoomUrl,
      stripeMode: isStripeConfigured,
    };
  },

  /** Starts payment for an appointment. Stripe Checkout or mock. */
  async startBookingCheckout(token: string) {
    const appt = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { service: true, patient: true, doctor: true },
    });
    if (!appt) throw new NotFoundError("Appointment not found");
    if (appt.status === "cancelled") throw new AppError("Appointment was cancelled", 409);
    if (appt.paymentStatus === "paid") throw new AppError("Already paid", 409);
    const amount = appt.service?.priceCents ?? 0;
    if (amount <= 0) throw new AppError("Nothing to pay for this appointment", 400);

    if (!isStripeConfigured) {
      return this.settleBookingPayment(appt.id, {
        provider: "mock",
        amountCents: amount,
      }).then(() => ({ url: `${env.appUrl}/pay/${token}?status=success` }));
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (appt.doctor.currency ?? "USD").toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: `${appt.service?.name ?? "Consultation"} — ${appt.doctor.fullName}`,
            },
          },
        },
      ],
      metadata: { kind: "booking", appointmentId: appt.id, token },
      success_url: `${env.appUrl}/pay/${token}?status=success`,
      cancel_url: `${env.appUrl}/pay/${token}?status=cancelled`,
    });
    await prisma.payment.create({
      data: {
        doctorId: appt.doctorId,
        appointmentId: appt.id,
        kind: "booking",
        status: "pending",
        provider: "stripe",
        amountCents: amount,
        currency: appt.doctor.currency ?? "USD",
        stripeSessionId: session.id,
      },
    });
    return { url: session.url! };
  },

  /** Marks an appointment paid, records the payment, auto-issues a receipt. */
  async settleBookingPayment(
    appointmentId: string,
    opts: {
      provider: "stripe" | "mock";
      amountCents: number;
      stripeSessionId?: string;
      stripePaymentIntentId?: string;
    },
  ) {
    const payment = opts.stripeSessionId
      ? await prisma.payment.update({
          where: { stripeSessionId: opts.stripeSessionId },
          data: { status: "succeeded", stripePaymentIntentId: opts.stripePaymentIntentId },
        })
      : await prisma.payment.create({
          data: {
            appointmentId,
            kind: "booking",
            status: "succeeded",
            provider: opts.provider,
            amountCents: opts.amountCents,
          },
        });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: "paid" },
    });
    await receiptService
      .createForAppointment(appointmentId, payment.id)
      .catch(() => {}); // receipt may already exist — never block settlement
    return payment;
  },
};
