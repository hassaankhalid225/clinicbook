import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { UnauthorizedError } from "@/lib/errors";
import { getSessionRole } from "@/core/auth/session";
import { moduleService } from "@/modules/billing/module.service";

const schema = z.object({ priceMonthlyCents: z.number().int().min(0).max(10_000_00) });

/** Admin edits a module's monthly price (audited in module_price_history). */
export const PUT = handle(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const role = await getSessionRole();
    if (role !== "admin") throw new UnauthorizedError("Admin access required");
    const { id } = await ctx.params;
    const { priceMonthlyCents } = schema.parse(await req.json());
    return ok(await moduleService.updatePrice(id, priceMonthlyCents, "admin"));
  },
);
