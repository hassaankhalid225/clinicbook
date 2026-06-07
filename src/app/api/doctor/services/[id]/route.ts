import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { serviceService } from "@/modules/services/service.service";
import { serviceSchema } from "@/modules/services/service.schema";

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    const input = serviceSchema.partial().parse(await req.json());
    return ok(await serviceService.update(doctor.id, id, input));
  },
);

export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    await serviceService.remove(doctor.id, id);
    return ok({ deleted: true });
  },
);
