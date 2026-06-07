import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { bookingService } from "@/modules/booking/booking.service";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const POST = handle(
  async (req: NextRequest, ctx: { params: Promise<{ token: string }> }) => {
    const { token } = await ctx.params;
    const { date, time } = schema.parse(await req.json());
    return ok(await bookingService.rescheduleByToken(token, date, time));
  },
);
