import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { repositories } from "@/core/repositories";

const schema = z.object({ reply: z.string().min(1).max(500) });

export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const { reply } = schema.parse(await req.json());
    return ok(await repositories.reviews.reply(id, reply));
  },
);
