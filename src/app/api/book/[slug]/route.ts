import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { createBookingSchema } from "@/modules/booking/booking.schema";
import { bookingService } from "@/modules/booking/booking.service";

export const POST = handle(
  async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const input = createBookingSchema.parse(await req.json());
    const result = await bookingService.createBooking(slug, input);
    return ok(result, 201);
  },
);
