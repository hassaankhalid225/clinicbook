import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { moduleService } from "@/modules/billing/module.service";
import { posService } from "@/modules/pos/pos.service";

const schema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        priceCents: z.number().int().min(0),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1),
  patientName: z.string().max(120).optional(),
  discountCents: z.number().int().min(0).optional(),
  taxCents: z.number().int().min(0).optional(),
  paymentMethod: z.enum(["cash", "card", "online"]).optional(),
});

/** POS terminal checkout for a clinic, identified by the doctor's slug. */
export const POST = handle(
  async (req: NextRequest, ctx: { params: Promise<{ username: string }> }) => {
    const { username } = await ctx.params;
    const doctor = await prisma.doctor.findUnique({
      where: { slug: username },
      select: { id: true },
    });
    if (!doctor) throw new NotFoundError("Clinic not found");
    if (!(await moduleService.hasModule(doctor.id, "pos"))) {
      throw new ForbiddenError("POS is not enabled for this clinic");
    }
    const input = schema.parse(await req.json());
    const sale = await posService.createSale(doctor.id, input);
    return ok({ id: sale.id, saleNumber: sale.saleNumber, totalCents: sale.totalCents }, 201);
  },
);
