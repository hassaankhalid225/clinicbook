import { env } from "@/lib/env";
import { isStripeConfigured } from "@/lib/stripe";

/** Whether each external integration has its keys configured (server-only). */
export function integrationStatus() {
  return {
    sms: Boolean(
      env.twilio.accountSid && env.twilio.authToken && env.twilio.fromNumber,
    ),
    email: Boolean(env.resend.apiKey),
    stripe: isStripeConfigured,
    video: true, // Jitsi public instance works with no key
  };
}

export const isSmsConfigured = () => integrationStatus().sms;
export const isEmailConfigured = () => integrationStatus().email;
