import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { slotsQuerySchema } from "@/modules/booking/booking.schema";
import { computeAvailableSlots } from "@/modules/booking/slots.service";
import { doctorService } from "@/modules/doctors/doctor.service";

export const GET = handle(
  async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
    const { slug } = await ctx.params;
    const { date } = slotsQuerySchema.parse({
      date: req.nextUrl.searchParams.get("date") ?? "",
    });

    const doctor = await doctorService.findPublicBySlug(slug);
    if (!doctor) throw new NotFoundError("Doctor not found");

    const result = await computeAvailableSlots(doctor.id, date);
    return ok({ ...result, doctor: doctor.fullName });
  },
);
