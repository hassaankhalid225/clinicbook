import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";

const schema = z.object({
  status: z.enum(["pending", "active", "suspended"]).optional(),
  verified: z.boolean().optional(),
});

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const { status, verified } = schema.parse(await req.json());
    let doctor = await repositories.doctors.getById(id);
    if (status) doctor = await repositories.doctors.setStatus(id, status);
    if (verified != null) doctor = await repositories.doctors.setVerified(id, verified);
    return ok(doctor);
  },
);
