import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { waitlistService } from "@/modules/waitlist/waitlist.service";

export const PUT = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    return ok(await waitlistService.invite(doctor.id, id));
  },
);

export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    await waitlistService.remove(doctor.id, id);
    return ok({ deleted: true });
  },
);
