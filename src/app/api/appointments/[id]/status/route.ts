import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { updateStatusSchema } from "@/modules/appointments/appointment.schema";

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    const input = updateStatusSchema.parse(await req.json());
    const updated = await appointmentService.updateStatus(doctor.id, id, input);
    return ok(updated);
  },
);
