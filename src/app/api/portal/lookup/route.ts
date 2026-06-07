import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { bookingService } from "@/modules/booking/booking.service";

const schema = z.object({ phone: z.string().min(5).max(20) });

export const POST = handle(async (req: NextRequest) => {
  const { phone } = schema.parse(await req.json());
  return ok(await bookingService.lookupByPhone(phone));
});
