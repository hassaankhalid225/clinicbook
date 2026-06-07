import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { availabilityService } from "@/modules/availability/availability.service";
import { ValidationError } from "@/lib/errors";

export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ dayOfWeek: string }> }) => {
    const doctor = await requireDoctorApi();
    const { dayOfWeek } = await ctx.params;
    const dow = Number(dayOfWeek);
    if (!Number.isInteger(dow) || dow < 0 || dow > 6) {
      throw new ValidationError("Invalid day of week");
    }
    await availabilityService.deleteRule(doctor.id, dow);
    return ok({ deleted: true });
  },
);
