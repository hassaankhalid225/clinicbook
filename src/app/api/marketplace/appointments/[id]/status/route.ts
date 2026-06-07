import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "rescheduled", "cancelled", "completed", "no_show"]),
});

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const { status } = schema.parse(await req.json());
    return ok(await repositories.appointments.setStatus(id, status));
  },
);
