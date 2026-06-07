import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, fail } from "@/lib/api";
import { repositories } from "@/core/repositories";
import { MOCK_CURRENT } from "@/core/utils/session";

const schema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500),
  durationMin: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).default("USD"),
  category: z.string().max(60),
  consultationType: z.enum(["online", "offline", "both"]),
  isActive: z.boolean().default(true),
});

export const POST = handle(async (req: NextRequest) => {
  const input = schema.parse(await req.json());
  const doctor = await repositories.doctors.getById(MOCK_CURRENT.doctorId);
  if (!doctor) return fail("Doctor not found", 404);
  const service = await repositories.services.create({
    ...input,
    doctorId: doctor.id,
    tenantId: doctor.tenantId,
  });
  return ok(service, 201);
});
