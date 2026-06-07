import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";

const schema = z.object({ moduleKey: z.string(), enabled: z.boolean() });

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const { moduleKey, enabled } = schema.parse(await req.json());
    const doctor = await repositories.doctors.setModuleAccess(id, moduleKey, enabled);
    return ok(doctor);
  },
);
