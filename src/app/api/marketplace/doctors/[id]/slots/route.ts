import type { NextRequest } from "next/server";
import { handle, ok, fail } from "@/lib/api";
import { repositories } from "@/core/repositories";

export const GET = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const date = req.nextUrl.searchParams.get("date");
    if (!date) return fail("date is required", 400);
    const slots = await repositories.availability.slotsFor(id, date);
    return ok({ date, slots });
  },
);
