import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { requireDoctorApi } from "@/lib/auth";
import { ForbiddenError } from "@/lib/errors";
import { moduleService } from "@/modules/billing/module.service";
import { posService } from "@/modules/pos/pos.service";

async function gate(doctorId: string) {
  if (!(await moduleService.hasModule(doctorId, "pos"))) {
    throw new ForbiddenError("The POS module is not active on your plan");
  }
}

export const GET = handle(async () => {
  const doctor = await requireDoctorApi();
  await gate(doctor.id);
  return ok(await posService.listProducts(doctor.id));
});

const createSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().max(60).default("General"),
  priceCents: z.number().int().min(0),
});

export const POST = handle(async (req: NextRequest) => {
  const doctor = await requireDoctorApi();
  await gate(doctor.id);
  const input = createSchema.parse(await req.json());
  return ok(await posService.createProduct(doctor.id, input), 201);
});
