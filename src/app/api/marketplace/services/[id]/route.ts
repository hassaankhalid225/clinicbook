import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";

const schema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  durationMin: z.number().int().min(5).max(480).optional(),
  priceCents: z.number().int().min(0).optional(),
  category: z.string().max(60).optional(),
  consultationType: z.enum(["online", "offline", "both"]).optional(),
  isActive: z.boolean().optional(),
});

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const input = schema.parse(await req.json());
    return ok(await repositories.services.update(id, input));
  },
);

export const DELETE = handle(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await repositories.services.remove(id);
    return ok({ deleted: true });
  },
);
