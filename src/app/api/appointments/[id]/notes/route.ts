import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { appointmentService } from "@/modules/appointments/appointment.service";
import { updateNotesSchema } from "@/modules/appointments/appointment.schema";

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    const { notes } = updateNotesSchema.parse(await req.json());
    const updated = await appointmentService.updateNotes(doctor.id, id, notes);
    return ok(updated);
  },
);
