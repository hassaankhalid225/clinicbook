import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { posService } from "@/modules/pos/pos.service";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.string().max(60).optional(),
  priceCents: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    const input = schema.parse(await req.json());
    return ok(await posService.updateProduct(doctor.id, id, input));
  },
);

export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const doctor = await requireDoctorApi();
    const { id } = await ctx.params;
    await posService.removeProduct(doctor.id, id);
    return ok({ deleted: true });
  },
);
