import Stripe from "stripe";

/**
 * Stripe client (server-only). The platform runs in two payment modes:
 *  - stripe: real Checkout sessions + webhooks (STRIPE_SECRET_KEY set)
 *  - mock:   payments succeed instantly and are recorded as provider="mock",
 *            so every flow stays end-to-end testable without keys.
 */
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set — running in mock payment mode");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
