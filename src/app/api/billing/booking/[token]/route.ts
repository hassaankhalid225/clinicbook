import { handle, ok } from "@/lib/api";
import { paymentService } from "@/modules/billing/payment.service";

/** Patient starts payment for their appointment (no auth — token is the key). */
export const POST = handle(
  async (_req: Request, ctx: { params: Promise<{ token: string }> }) => {
    const { token } = await ctx.params;
    return ok(await paymentService.startBookingCheckout(token));
  },
);
