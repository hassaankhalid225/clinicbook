import { handle, ok } from "@/lib/api";
import { bookingService } from "@/modules/booking/booking.service";

export const POST = handle(
  async (_req: Request, ctx: { params: Promise<{ token: string }> }) => {
    const { token } = await ctx.params;
    const result = await bookingService.cancelByToken(token);
    return ok(result);
  },
);
