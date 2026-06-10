import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, STRIPE_WEBHOOK_SECRET, isStripeConfigured } from "@/lib/stripe";
import { moduleService } from "@/modules/billing/module.service";
import { paymentService } from "@/modules/billing/payment.service";

/**
 * Stripe webhook — the single source of truth for real payment state.
 *   checkout.session.completed → activate modules / settle booking payment
 *   customer.subscription.updated|deleted → keep TenantSubscription in sync
 *
 * Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe] webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const meta = session.metadata ?? {};
        if (meta.kind === "module_subscription" && meta.doctorId) {
          await moduleService.activateSelection(
            meta.doctorId,
            (meta.moduleIds ?? "").split(",").filter(Boolean),
            {
              provider: "stripe",
              stripeCustomerId: String(session.customer ?? ""),
              stripeSubscriptionId: String(session.subscription ?? ""),
            },
          );
          await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: { status: "succeeded" },
          });
        } else if (meta.kind === "booking" && meta.appointmentId) {
          await paymentService.settleBookingPayment(meta.appointmentId, {
            provider: "stripe",
            amountCents: session.amount_total ?? 0,
            stripeSessionId: session.id,
            stripePaymentIntentId: String(session.payment_intent ?? ""),
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        await prisma.tenantSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "incomplete",
            currentPeriodEnd: new Date(sub.items.data[0]?.current_period_end ? sub.items.data[0].current_period_end * 1000 : Date.now()),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await prisma.tenantSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "cancelled" },
        });
        break;
      }
      default:
        break; // unhandled event types are fine
    }
  } catch (err) {
    console.error(`[stripe] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
