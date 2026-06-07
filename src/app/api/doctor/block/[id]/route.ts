import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { availabilityService } from "@/modules/availability/availability.service";

export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    await availabilityService.removeBlock(doctor.id, id);
    return ok({ deleted: true });
  },
);
